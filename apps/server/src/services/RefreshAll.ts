import db from "../db.js";
import { RefreshFeed } from "./RefreshFeed.js";

export default async function RefreshAll() {
  const feeds = await db.feed.findMany();
  await Promise.all(
    feeds.map(async (feed) => {
      return RefreshFeed(feed.id);
    })
  );
}
