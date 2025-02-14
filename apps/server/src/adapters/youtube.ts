import RSS from "rss-parser";
import * as cheerio from "cheerio";
import { Adapter } from "./index.js";
import { RSSAdapter } from "./rss.js";
import log from "../log.js";

export const YoutubeAdapter: Adapter = {
  async getSources(url) {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    return [
      {
        url,
        name: $('meta[property="og:title"]').attr("content") ?? null,
        iconUrl: $('meta[property="og:image"]').attr("content") ?? null,
      },
    ];
  },

  async latest(url: string) {
    const res = await fetch(url);
    const body = await res.text();

    const $ = cheerio.load(body);
    const href = $('link[type="application/rss+xml"]').attr("href");
    if (!href) {
      log.error(`Could not find feed for ${url}`);
      return [];
    }

    return RSSAdapter.latest(href);
  },
};
