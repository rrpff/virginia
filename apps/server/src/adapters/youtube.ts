import RSS from "rss-parser";
import * as cheerio from "cheerio";
import { Adapter } from ".";

export const YoutubeAdapter: Adapter = {
  hostname: "www.youtube.com",
  site: async (url: string) => {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    return {
      name: $('meta[property="og:title"]').attr("content"),
      icon_url: $('meta[property="og:image"]').attr("content"),
    };
  },
  feed: async (url: string) => {
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
  },
};
