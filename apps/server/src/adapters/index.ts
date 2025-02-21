import { Item } from "@prisma/client";
import { backOff } from "exponential-backoff";
import { PatreonAdapter } from "./patreon.js";
import { RSSAdapter } from "./rss.js";
// import { WikipediaAdapter } from "./wikipedia.js";
import { YoutubeAdapter } from "./youtube.js";
import { BlueskyAdapter } from "./bluesky.js";

export type FeedDefinition = {
  url: string;
  name: string | null;
  iconUrl: string | null;
};

export type SourceItem = {
  title: string;
  url: string;
  imageUrl: string | null;
  description: string | null;
  timestamp: Date;
  id: string | null;
  hash: string;
};

export type Adapter = {
  getSources(url: string): Promise<FeedDefinition[]>;
  latest(url: string): Promise<SourceItem[]>;
};

function GetAdapter(url: string): Adapter {
  const hostname = new URL(url).hostname;

  // if (hostname.match(/^\w+\.wikipedia\.org/)) return WikipediaAdapter;
  if (hostname.match(/^(www\.)?youtube\.com/)) return YoutubeAdapter;
  if (hostname.match(/^(www\.)?patreon\.com/)) return PatreonAdapter;
  if (hostname.match(/^(www\.)?bsky\.app/)) return BlueskyAdapter;
  return RSSAdapter;
}

export function GetUrlSources(url: string) {
  const adapter = GetAdapter(url);
  return adapter.getSources(url);
}

export async function GetSiteLatest(url: string) {
  const adapter = GetAdapter(url);
  return await backOff(() => adapter.latest(url), {
    numOfAttempts: 3,
    startingDelay: 100,
    timeMultiple: 5,
    jitter: "full",
  });
}
