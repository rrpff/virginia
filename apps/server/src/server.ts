import express from "express";
import cors from "cors";
import { proc, router } from "./rpc.js";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { Feed, PrismaClient, Feed as PrismaFeed } from "@prisma/client";
import z from "zod";
import { Adapter } from "./adapters/index.js";
import { RSSAdapter } from "./adapters/rss.js";
import { PatreonAdapter } from "./adapters/patreon.js";
import { YoutubeAdapter } from "./adapters/youtube.js";
import { FeedItem, Site } from "./schema.js";
import { slug } from "../utils/ids.js";

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

  let items: Omit<FeedItem, "id" | "feedId">[] = [];
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
        iconUrl: site.iconUrl,
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
        imageUrl: item.imageUrl,
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
        categoryIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input: { url, categoryIds } }) => {
      return await db.feed.create({
        data: {
          url,
          categories: {
            connect: categoryIds.map((categoryId) => ({
              id: categoryId,
            })),
          },
        },
      });
    }),

  updateFeed: proc
    .input(
      z.object({
        id: z.string(),
        url: z.string().url().optional(),
        categories: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input: { id, url, categories } }) => {
      return await db.feed.update({
        where: { id },
        data: {
          url,
          categories: categories
            ? {
                connect: categories.map((category) => ({
                  id: category,
                })),
              }
            : undefined,
        },
      });
    }),

  refresh: proc.mutation(async () => {
    await refresh();
  }),

  categories: proc.query(async () => {
    return db.category.findMany({ orderBy: { position: "asc" } });
  }),

  setCategoryPosition: proc
    .input(
      z.object({ categoryId: z.string(), position: z.number().int().gte(0) })
    )
    .mutation(async ({ input: { categoryId, position } }) => {
      const category = await db.category.findFirst({
        where: { id: categoryId },
        select: { position: true },
      });

      if (!category) return;
      if (category.position === position) return;

      if (category.position > position) {
        await db.$transaction([
          db.category.updateMany({
            where: { position: { gte: position, lt: category.position } },
            data: { position: { increment: 1 } },
          }),
          db.category.update({
            where: { id: categoryId },
            data: { position },
          }),
        ]);
      } else {
        await db.$transaction([
          db.category.updateMany({
            where: { position: { lte: position, gt: category.position } },
            data: { position: { decrement: 1 } },
          }),
          db.category.update({
            where: { id: categoryId },
            data: { position },
          }),
        ]);
      }
    }),

  // TODO: validate icon+name are not taken
  addCategory: proc
    .input(z.object({ name: z.string(), icon: z.string() }))
    .mutation(async ({ input: { name, icon } }) => {
      const vanity = slug(name);
      const position = await db.category.count();
      return db.category.create({
        data: {
          name,
          icon,
          vanity,
          position,
        },
      });
    }),

  feed: proc
    .input(z.object({ id: z.string() }))
    .query(async ({ input: { id } }) => {
      return await db.feed.findFirst({
        where: { id },
        include: {
          categories: true,
          items: { orderBy: { timestamp: "desc" } },
        },
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
        include: { items: { orderBy: { timestamp: "desc" }, take: 3 } },
        where: category
          ? {
              categories: {
                some: {
                  vanity: category,
                },
              },
            }
          : {},
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
