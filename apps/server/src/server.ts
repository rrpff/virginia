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
import { FeedItem } from "./schema";

const ADAPTERS = [RSSAdapter, PatreonAdapter, YoutubeAdapter];

function getAdapter(feed: PrismaFeed): Adapter {
  const url = new URL(feed.url);
  const adapter = ADAPTERS.find((a) => a.hostname === url.hostname);
  return adapter ?? RSSAdapter;
}

async function refreshFeed(feed: PrismaFeed) {
  const adapter = getAdapter(feed);
  const site = await adapter.site(feed.url); // TODO: not every time lol
  const items = await adapter.feed(feed.url);

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
        url: item.url,
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
    .input(z.object({ url: z.string().url() }))
    .mutation(async ({ input: { url } }) => {
      return await db.feed.create({
        data: {
          url,
        },
      });
    }),

  refresh: proc.mutation(async () => {
    await refresh();
  }),

  feeds: proc.query(async () => {
    const feedOrders = await db.feedItem.groupBy({
      by: ["feedId"],
      _max: {
        timestamp: true,
      },
    });

    const feeds = await db.feed.findMany({
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

  items: proc
    .input(
      z.object({
        feedId: z.string(),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input: { feedId, cursor } }) => {
      return db.feedItem.findMany({
        orderBy: [{ timestamp: "desc" }, { url: "desc" }],
        cursor: cursor ? { id: cursor } : undefined,
        where: { feedId },
        skip: cursor ? 1 : 0,
        take: 5,
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
