import express from "express";
import cors from "cors";
import { proc, router } from "./rpc";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { Feed, PrismaClient, Feed as PrismaFeed } from "@prisma/client";
import z from "zod";
import { Adapter } from "./adapters";
import { RSSAdapter } from "./adapters/rss";
import { PatreonAdapter } from "./adapters/patreon";
import { YoutubeAdapter } from "./adapters/youtube";
import { FeedItem, Site } from "./schema";
import { keys } from "../utils/objects";

const ADAPTERS = [RSSAdapter, PatreonAdapter, YoutubeAdapter];

function getAdapter(feed: PrismaFeed): Adapter {
  const url = new URL(feed.url);
  const adapter = ADAPTERS.find((a) => a.hostname === url.hostname);
  return adapter ?? RSSAdapter;
}

async function refreshFeed(feed: PrismaFeed) {
  const adapter = getAdapter(feed);

  let site: Site = {};
  try {
    site = await adapter.site(feed.url); // TODO: not every time lol
  } catch (err) {
    console.error(`Unable to fetch site meta for ${feed.url}: ${err}`);
  }

  let items: FeedItem[] = [];
  try {
    items = await adapter.feed(feed.url);
  } catch (err) {
    console.error(`Unable to fetch items for ${feed.url}: ${err}`);
  }

  return {
    site,
    items,
  };
}

async function refresh() {
  const feeds = await db.feed.findMany();
  const updates = await Promise.all(
    feeds.map(async (feed) => {
      const { site, items } = await refreshFeed(feed);
      return { site, items, feed };
    })
  );

  const allItems: (FeedItem & { feed: Feed })[] = [];
  for (const { site, items, feed } of updates) {
    allItems.push(...items.map((item) => ({ ...item, feed })));
    await db.feed.update({
      where: { id: feed.id },
      data: {
        name: site.name,
        iconUrl: site.icon_url,
      },
    });
  }

  await db.feedItem.deleteMany();
  await db.feedItem.createMany({
    data: allItems.map((item) => {
      return {
        feedId: item.feed.id,
        url: item.url ?? item.feed.url, // TODO: what do i do here??? tilde town help
        title: item.title,
        description: item.description,
        imageUrl: item.image_url,
        timestamp: new Date(item.timestamp),
      };
    }),
  });
}

const app = express();
const db = new PrismaClient();
const rpc = router({
  addFeed: proc
    .input(
      z.object({
        url: z.string().url(),
        categories: z.string().optional(),
      })
    )
    .mutation(async ({ input: { url, categories } }) => {
      return await db.feed.create({
        data: {
          url,
          categories,
        },
      });
    }),

  updateFeed: proc
    .input(
      z.object({
        id: z.string(),
        url: z.string().url().optional(),
        categories: z.string().optional(),
      })
    )
    .mutation(async ({ input: { id, url, categories } }) => {
      return await db.feed.update({
        where: { id },
        data: {
          url,
          categories,
        },
      });
    }),

  refresh: proc.mutation(async () => {
    await refresh();
  }),

  categories: proc.query(async () => {
    const feeds = await db.feed.findMany();
    const feedCategories = feeds.flatMap((f) =>
      !f.categories ? [] : f.categories.split(" ").map((c) => c.trim())
    );
    const categories: Record<string, number> = {};
    for (const category of feedCategories) {
      categories[category] ||= 0;
      categories[category] += 1;
    }

    return keys(categories).sort((a, b) => {
      return categories[a]! > categories[b]!
        ? -1
        : categories[b]! > categories[a]!
        ? 1
        : 0;
    });
  }),

  feed: proc
    .input(z.object({ id: z.string() }))
    .query(async ({ input: { id } }) => {
      return await db.feed.findFirst({
        where: { id },
        include: { items: { orderBy: { timestamp: "desc" } } },
      });
    }),

  feeds: proc
    .input(z.object({ category: z.string().optional() }))
    .query(async ({ input: { category } }) => {
      const feedOrders = await db.feedItem.groupBy({
        by: ["feedId"],
        _max: {
          timestamp: true,
        },
      });

      const feeds = await db.feed.findMany({
        where: category ? { categories: { contains: category } } : {},
        include: { items: { orderBy: { timestamp: "desc" }, take: 3 } },
      });

      return feeds
        .map((feed) => {
          const latest = feedOrders.find((f) => f.feedId === feed.id);
          return {
            ...feed,
            latest: latest ? Number(latest._max.timestamp) : null,
          };
        })
        .sort((a, b) => {
          if (!a.latest || !b.latest) return 0;
          return a.latest > b.latest ? -1 : b.latest > a.latest ? 1 : 0;
        });
    }),
});

app.use(cors());
app.use(
  "/rpc",
  createExpressMiddleware({
    router: rpc,
    onError({ error }) {
      console.error("Error:", error);
    },
  })
);

export default app;
export type RPC = typeof rpc;
