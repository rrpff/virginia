import express from "express";
import RSS from "rss-parser";
import * as cheerio from "cheerio";
import cors from "cors";
import { proc, router } from "./rpc";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { Feed } from "./schema";
import { Prisma, PrismaClient, Feed as PrismaFeed } from "@prisma/client";
import z from "zod";

type Handler = (url: string) => Promise<Feed>;

function getHandler(feed: PrismaFeed): Handler {
  const url = new URL(feed.url);
  switch (url.hostname) {
    case "www.youtube.com":
      return youtube;
    case "www.patreon.com":
      return patreon;
    default:
      return rss;
  }
}

async function refreshFeed(feed: PrismaFeed) {
  const handler = getHandler(feed);
  const items = await handler(feed.url);

  // TODO: fix this lol
  await db.feedItem.deleteMany({
    where: { feedId: feed.id, url: { in: items.map((i) => i.url) } },
  });

  await db.feedItem.createMany({
    data: items.map((item) => {
      return {
        feedId: feed.id,
        url: item.url,
        title: item.title,
        description: item.description,
        imageUrl: item.image_url,
        timestamp: new Date(item.timestamp),
      };
    }),
  });
}

async function refresh() {
  const feeds = await db.feed.findMany();
  await Promise.all(
    feeds.map((feed) => {
      return refreshFeed(feed);
    })
  );
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
app.use("/rpc", createExpressMiddleware({ router: rpc }));

export default app;
export type RPC = typeof rpc;

const rss: Handler = async (url: string) => {
  const rss = new RSS();
  const { items } = await rss.parseURL(url); // TODO: get/write a parser that includes images
  return items.map((item) => {
    return {
      url: item.link!,
      title: item.title!,
      description: item.contentSnippet!,
      image_url: undefined, // TODO: implement
      timestamp: Date.parse(item.isoDate!),
    };
  });
};

const youtube: Handler = async (url: string) => {
  const res = await fetch(url);
  const body = await res.text();

  const $ = cheerio.load(body);
  const href = $('link[type="application/rss+xml"]').attr("href");

  const rss = new RSS();
  const { items } = await rss.parseURL(href!);
  return items.map((item) => {
    return {
      url: item.link!,
      title: item.title!,
      description: item.contentSnippet!,
      image_url: undefined, // TODO: implement
      timestamp: Date.parse(item.isoDate!),
    };
  });
};

type PatreonPostsResponse = {
  data: {
    type: "post"; // or other
    attributes: {
      published_at: string; // iso date
      title: string;
      teaser_text: string;
      url: string;
      image?: {
        width: number;
        height: number;
        large_url: string;
        thumb_square_large_url: string;
        thumb_square_url: string;
        thumb_url: string;
        url: string;
      };
    };
  }[];
};

const patreon: Handler = async (url: string) => {
  const ires = await fetch(url);
  const itext = await ires.text();
  const $ = cheerio.load(itext);
  const meta = $("script#__NEXT_DATA__").text();
  const ijson = JSON.parse(meta);
  const creatorId =
    ijson.props.pageProps.bootstrapEnvelope.pageBootstrap.campaign.data.id;

  const u = new URL("https://www.patreon.com/api/posts");
  u.searchParams.set("filter[campaign_id]", creatorId);
  u.searchParams.set("sort", "-published_at");

  const res = await fetch(u);
  const json = (await res.json()) as PatreonPostsResponse;

  return json.data
    .filter((item) => item.type === "post")
    .map((item) => {
      return {
        url: item.attributes.url,
        title: item.attributes.title,
        description: item.attributes.teaser_text,
        image_url: item.attributes.image?.large_url, // TODO: implement
        timestamp: Date.parse(item.attributes.published_at),
      };
    });
};
