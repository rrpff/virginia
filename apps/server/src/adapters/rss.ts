import RSS from "rss-parser";
import * as cheerio from "cheerio";
import url from "url";
import { Adapter } from "./index.js";

export const RSSAdapter: Adapter = {
  async getSources(url: string) {
    const feedUrls = await getFeedUrls(url);
    const favicon = await getFavicon(url);

    return await Promise.all(
      feedUrls.map(async (feedUrl) => {
        const data = await new RSS().parseURL(feedUrl);
        const icon = data.image?.url ?? favicon;

        return {
          name: data.title ?? null,
          iconUrl: icon,
          url: feedUrl,
        };
      })
    );
  },

  async latest(feedUrl: string) {
    const rss = new RSS();
    const { items } = await rss.parseURL(feedUrl);

    return items.map((item) => {
      const title = item.title ?? item.contentSnippet ?? "";
      let description = item.contentSnippet;
      if (title === description) {
        description = undefined;
      }

      return {
        url: item.link!,
        title: title,
        description: description ?? null,
        imageUrl: null,
        timestamp: item.isoDate ? new Date(item.isoDate) : new Date(-1),
      };
    });
  },
};

const FEED_EXTENSIONS = [".rss", ".atom", "xml"];
async function getFeedUrls(uri: string): Promise<string[]> {
  if (FEED_EXTENSIONS.some((ext) => uri.endsWith(ext))) return [uri];

  const res = await fetch(uri);
  const html = await res.text();

  try {
    // If the URL itself parses as RSS, return it
    await new RSS().parseString(html);
    return [uri];
  } catch (_err) {
    const $ = cheerio.load(html);

    const feeds: string[] = [];

    // Add all RSS feeds
    $('link[type="application/rss+xml"]').each((_, el) => {
      const href = $(el).attr("href");
      if (href) {
        feeds.push(url.resolve(uri, href));
      }
    });

    // Add all atom feeds
    $('link[type="application/atom+xml"]').each((_, el) => {
      const href = $(el).attr("href");
      if (href) {
        feeds.push(url.resolve(uri, href));
      }
    });

    return feeds;
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
    $('link[rel="shortcut icon"]').attr("href")?.trim() ??
    $('link[rel="icon"][href$="ico"]').attr("href")?.trim() ??
    "/favicon.ico";

  return url.resolve(root.origin, href);
}
