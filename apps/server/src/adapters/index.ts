import type { FeedItem, Site } from "../schema.js";

export type Adapter = {
  hostname?: RegExp;
  site(url: string): Promise<Site>;
  feed(url: string): Promise<FeedItem[]>;
};
