import type { Feed, Site } from "../schema";

export type Adapter = {
  hostname?: string;
  site(url: string): Promise<Site>;
  feed(url: string): Promise<Feed>;
};
