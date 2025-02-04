import RSS from "rss-parser";
import * as cheerio from "cheerio";
import url from "url";
import { Adapter } from "./index.js";

export const RSSAdapter: Adapter = {
  site: async (siteUrl: string) => {
    const feedUrl = await resolve(siteUrl);
    const data = await new RSS().parseURL(feedUrl);
    const icon = data.image?.url ?? (await getFavicon(siteUrl));

    return {
      name: data.title,
      iconUrl: icon,
    };
  },
  feed: async (siteUrl: string) => {
    const feedUrl = await resolve(siteUrl);
    const rss = new RSS();
    const { items } = await rss.parseURL(feedUrl); // TODO: get/write a parser that includes images

    return items.map((item) => {
      const title = item.title || item.contentSnippet;
      let description = item.contentSnippet;
      if (title === description) {
        description = undefined;
      }

      return {
        url: item.link!,
        title: title!,
        description: description,
        imageUrl: undefined, // TODO: implement
        timestamp: Date.parse(item.isoDate!),
      };
    });
  },
};

const FEED_EXTENSIONS = [".rss", ".atom", "xml"];
async function resolve(uri: string) {
  if (FEED_EXTENSIONS.some((ext) => uri.endsWith(ext))) return uri;

  const res = await fetch(uri);
  const html = await res.text();

  try {
    // Try and parse the RSS
    await new RSS().parseString(html);
    return uri;
  } catch (_err) {
    const $ = cheerio.load(html);
    const href =
      $('link[type="application/rss+xml"]').attr("href") ||
      $('link[type="application/atom+xml"]').attr("href") ||
      uri;

    return url.resolve(uri, href);
  }
}

async function getFavicon(siteUrl: string) {
  const root = new URL(siteUrl);
  const res = await fetch(root);
  const html = await res.text();

  const $ = cheerio.load(html);
  const href =
    $('link[rel="icon"][sizes="32x32"]').attr("href")?.trim() ??
    $('link[rel="icon"][sizes="16x16"]').attr("href")?.trim() ??
    $('link[rel="icon"][href$="ico"]').attr("href")?.trim() ??
    "/favicon.ico";

  return url.resolve(root.origin, href);
}
