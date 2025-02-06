import RSS from "rss-parser";
import * as cheerio from "cheerio";
import { Adapter } from "./index.js";

export const YoutubeAdapter: Adapter = {
  async getSources(url) {
    const site = await this.site(url);
    return [
      {
        url,
        name: site.name ?? null,
        iconUrl: site.iconUrl ?? null,
      },
    ];
  },

  async site(url: string) {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    return {
      name: $('meta[property="og:title"]').attr("content"),
      iconUrl: $('meta[property="og:image"]').attr("content"),
    };
  },

  async latest(url: string) {
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
        imageUrl: undefined, // TODO: implement
        timestamp: Date.parse(item.isoDate!),
      };
    });
  },
};
