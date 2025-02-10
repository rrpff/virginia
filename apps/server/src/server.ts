import express from "express";
import cors from "cors";
import { proc, router } from "./rpc.js";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import z from "zod";
import { slug } from "../utils/ids.js";
import db from "./db.js";
import {
  CategoryDeleteSchema,
  FeedCreateSchema,
  FeedDeleteSchema,
  FeedUpdateSchema,
  ServerEvent,
  SourceCreateSchema,
  SourceDeleteSchema,
} from "./schema.js";
import RefreshScheduler from "./schedulers/RefreshScheduler.js";
import { GetUrlSources } from "./adapters/index.js";

const app = express();
const rpc = router({
  sourcesForUrl: proc
    .input(z.object({ url: z.string().url() }))
    .query(async ({ input: { url } }) => {
      return GetUrlSources(url);
    }),

  addFeed: proc
    .input(FeedCreateSchema)
    .mutation(async ({ input: { sources, categoryIds } }) => {
      const feed = await db.feed.create({
        data: {
          name: sources[0]?.name,
          iconUrl: sources[0]?.iconUrl,
          sources: {
            create: sources,
          },
          categories: {
            connect: categoryIds.map((categoryId) => ({
              id: categoryId,
            })),
          },
        },
      });

      RefreshScheduler.refreshFeed(feed.id);
      return feed;
    }),

  updateFeed: proc.input(FeedUpdateSchema).mutation(async ({ input }) => {
    const feed = await db.feed.update({
      where: { id: input.id },
      data: {
        name: input.name,
        iconUrl: input.iconUrl,
        categories: input.categoryIds
          ? {
              set: [],
              connect: input.categoryIds.map((categoryId) => ({
                id: categoryId,
              })),
            }
          : undefined,
      },
    });

    RefreshScheduler.refreshFeed(feed.id);
    return feed;
  }),

  deleteFeed: proc.input(FeedDeleteSchema).mutation(async ({ input }) => {
    await db.feed.delete({ where: { id: input.feedId } });
  }),

  addSource: proc.input(SourceCreateSchema).mutation(async ({ input }) => {
    const source = await db.source.create({ data: input });

    // Update feed icon if needed
    await db.feed.update({
      where: { id: input.feedId, iconUrl: null },
      data: { iconUrl: source.iconUrl ?? null },
    });

    RefreshScheduler.refreshSource(source.id);
    return source;
  }),

  deleteSource: proc.input(SourceDeleteSchema).mutation(async ({ input }) => {
    const source = await db.source.findFirst({ where: { id: input.sourceId } });
    if (!source) return;

    await db.source.delete({ where: { id: input.sourceId } });

    // Clear feed icon if needed
    const feed = await db.feed.findFirst({
      where: { id: source.feedId },
      include: { _count: true },
    });

    if (feed?._count.sources === 0) {
      await db.feed.update({ where: { id: feed.id }, data: { iconUrl: null } });
    }
  }),

  refresh: proc.mutation(() => {
    RefreshScheduler.refreshAll();
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

      await db.$transaction([
        db.category.updateMany({
          data:
            category.position > position
              ? { position: { increment: 1 } }
              : { position: { decrement: 1 } },
          where:
            category.position > position
              ? { position: { gte: position, lt: category.position } }
              : { position: { lte: position, gt: category.position } },
        }),
        db.category.update({
          data: { position },
          where: { id: categoryId },
        }),
      ]);
    }),

  deleteCategory: proc
    .input(CategoryDeleteSchema)
    .mutation(async ({ input }) => {
      const category = await db.category.findFirst({
        where: { id: input.categoryId },
      });
      if (!category) return;

      await db.$transaction([
        db.category.delete({ where: { id: input.categoryId } }),
        db.category.updateMany({
          where: { position: { gt: category.position } },
          data: { position: { decrement: 1 } },
        }),
      ]);
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
          sources: {
            include: {
              items: true,
            },
          },
        },
      });
    }),

  category: proc
    .input(z.object({ vanity: z.string().optional() }))
    .query(async ({ input: { vanity } }) => {
      if (vanity) {
        const category = db.category.findFirst({ where: { vanity } });
        if (!category) return null;
      }

      const sourceOrders = await db.item.groupBy({
        by: ["sourceId"],
        _max: {
          timestamp: true,
        },
      });

      const feeds = await db.feed.findMany({
        include: {
          sources: {
            include: {
              items: { orderBy: { timestamp: "desc" }, take: 3 },
            },
          },
        },
        where: vanity
          ? {
              categories: {
                some: {
                  vanity: vanity,
                },
              },
            }
          : {},
      });

      return {
        feeds: feeds
          .map((feed) => {
            const sourceTimestamps = sourceOrders
              .filter((so) => feed.sources.some((s) => s.id === so.sourceId))
              .map((so) => Number(so._max.timestamp));

            const latest = Math.max(...sourceTimestamps) ?? -1;

            return {
              ...feed,
              latest: latest,
            };
          })
          .sort((a, b) => {
            if (!a.latest || !b.latest) return 0;
            return a.latest > b.latest ? -1 : b.latest > a.latest ? 1 : 0;
          }),
      };
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

app.post("/api/refresh", (_req, res) => {
  RefreshScheduler.refreshAll();
  res.status(202).send({});
});

app.get("/sse", (_req, res) => {
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (event: ServerEvent) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  const started = () => send({ type: "refresh-started" });
  const ended = () => send({ type: "refresh-ended" });
  const updated = (feedId: string) => send({ type: "feed-updated", feedId });

  RefreshScheduler.on("refresh-started", started);
  RefreshScheduler.on("refresh-ended", ended);
  RefreshScheduler.on("feed-updated", updated);

  res.on("close", () => {
    RefreshScheduler.off("refresh-started", started);
    RefreshScheduler.off("refresh-ended", ended);
    RefreshScheduler.off("feed-updated", updated);
    res.end();
  });
});

export default app;
export type RPC = typeof rpc;
