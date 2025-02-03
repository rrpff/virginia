import express from "express";
import RSS from "rss-parser";
import * as cheerio from "cheerio";

const app = express();
export default app;

type Feed = FeedItem[];
type FeedItem = {
  url: string;
  title: string;
  description: string;
  image_url?: string;
  timestamp: number;
};

app.get("/", async (req, res) => {
  const kicks = await rss("https://www.kickscondor.com/rss.xml");
  const brr = await rss("https://brr.fyi/feed.xml");
  const contraYT = await youtube("https://www.youtube.com/contrapoints");
  const contraPatreon = await patreon("https://www.patreon.com/contrapoints");
  const chapo = await patreon("https://www.patreon.com/chapotraphouse");
  const archive = await rss("https://blog.archive.org/feed/");

  const items = [
    ...kicks,
    ...brr,
    ...contraYT,
    ...contraPatreon,
    ...chapo,
    ...archive,
  ];

  const feed = items.sort((a, b) => {
    if (!a.timestamp || !b.timestamp) return 0; // TODO: ignore i guess? lol, or have 'first seen'
    return a.timestamp > b.timestamp ? -1 : a.timestamp < b.timestamp ? 1 : 0;
  });

  res.json(feed);
});

async function rss(url: string): Promise<Feed> {
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
}

async function youtube(url: string): Promise<Feed> {
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
}

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

async function patreon(url: string): Promise<Feed> {
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
}
