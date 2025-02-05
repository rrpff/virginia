import { TypedEmitter } from "tiny-typed-emitter";
import { RefreshFeed } from "../services/RefreshFeed.js";
import db from "../db.js";

type Events = {
  "refresh-started": () => void;
  "refresh-ended": () => void;
  "feed-updated": (feedId: string) => void;
};

export default class RefreshScheduler extends TypedEmitter<Events> {
  private refreshCount = 0;
  constructor() {
    super();
  }

  async refreshAll() {
    const feeds = await db.feed.findMany();
    await Promise.all(feeds.map((feed) => this.refresh(feed.id)));
  }

  async refresh(feedId: string) {
    return this.run(async () => {
      await RefreshFeed(feedId);
      this.emit("feed-updated", feedId);
    });
  }

  private async run(handler: () => Promise<void>) {
    if (this.refreshCount === 0) {
      this.emit("refresh-started");
    }

    this.refreshCount++;
    await handler();
    this.refreshCount--;

    if (this.refreshCount === 0) {
      this.emit("refresh-ended");
    }
  }
}
