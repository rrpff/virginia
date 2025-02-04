import RSS from "rss-parser";
import * as cheerio from "cheerio";
import url from "url";
import { Adapter } from ".";

export const RSSAdapter: Adapter = {
  site: async (feedUrl: string) => {
    // TODO: use url given instead of root - think neocities
    const root = new URL(feedUrl);
    root.pathname = "/";

    const res = await fetch(root);
    const html = await res.text();
    const data = await new RSS().parseURL(feedUrl);
    const icon = getIcon(root, html);

    return {
      name: data.title,
      icon_url: icon,
    };
  },
  feed: async (feedUrl: string) => {
    const rss = new RSS();
    const { items } = await rss.parseURL(feedUrl); // TODO: get/write a parser that includes images
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

function getIcon(rootUrl: URL, html: string) {
  const $ = cheerio.load(html);
  const href =
    $('link[rel="icon"][sizes="32x32"]').attr("href")?.trim() ??
    $('link[rel="icon"][sizes="16x16"]').attr("href")?.trim() ??
    $('link[rel="icon"][href$="ico"]').attr("href")?.trim() ??
    "/favicon.ico";

  return url.resolve(rootUrl.origin, href);
}
