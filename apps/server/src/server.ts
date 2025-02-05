import express from "express";
import cors from "cors";
import { proc, router } from "./rpc.js";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import z from "zod";
import { slug } from "../utils/ids.js";
import db from "./db.js";
import RefreshAll from "./services/RefreshAll.js";
import { RefreshFeed } from "./services/RefreshFeed.js";

// TODO: update client on changes

const app = express();
const rpc = router({
  addFeed: proc
    .input(
      z.object({
        url: z.string().url(),
        categoryIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input: { url, categoryIds } }) => {
      const feed = await db.feed.create({
        data: {
          url,
          categories: {
            connect: categoryIds.map((categoryId) => ({
              id: categoryId,
            })),
          },
        },
      });

      RefreshFeed(feed.id); // TODO: add proper side bg handling rather than just throwing promises out there
      return feed;
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
      const feed = await db.feed.update({
        where: { id },
        data: {
          url,
          categories: categories
            ? {
                set: [],
                connect: categories.map((category) => ({
                  id: category,
                })),
              }
            : undefined,
        },
      });

      RefreshFeed(feed.id);
      return feed;
    }),

  refresh: proc.mutation(async () => {
    await RefreshAll(); // TODO: sameee
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
