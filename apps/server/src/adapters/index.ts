import type { Feed, Site } from "../schema.js";

export type Adapter = {
  hostname?: string;
  site(url: string): Promise<Site>;
  feed(url: string): Promise<Feed>;
};
