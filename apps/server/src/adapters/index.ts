import type { FeedItem, Site } from "../schema.js";
import { PatreonAdapter } from "./patreon.js";
import { RSSAdapter } from "./rss.js";
// import { WikipediaAdapter } from "./wikipedia.js";
import { YoutubeAdapter } from "./youtube.js";

export type FeedDefinition = {
  url: string;
  name: string | null;
  iconUrl: string | null;
};

export type Adapter = {
  getFeedDefinitions(url: string): Promise<FeedDefinition[]>;
  site(url: string): Promise<Site>;
  feed(url: string): Promise<FeedItem[]>;
};

export function GetAdapter(url: string): Adapter {
  const hostname = new URL(url).hostname;

  // if (hostname.match(/^\w+\.wikipedia\.org/)) return WikipediaAdapter;
  if (hostname.match(/^(www\.)?youtube\.com/)) return YoutubeAdapter;
  if (hostname.match(/^(www\.)?patreon\.com/)) return PatreonAdapter;
  return RSSAdapter;
}
