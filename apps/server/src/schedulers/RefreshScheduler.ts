import { TypedEmitter } from "tiny-typed-emitter";
import { RefreshSource } from "../services/RefreshSource.js";
import db from "../db.js";

type Events = {
  "refresh-started": () => void;
  "refresh-ended": () => void;
  "feed-updated": (feedId: string) => void;
};

class RefreshScheduler extends TypedEmitter<Events> {
  private refreshCount = 0;
  constructor() {
    super();
  }

  async refreshAll() {
    return this.run(async () => {
      const feeds = await db.feed.findMany();
      await Promise.all(
        feeds.map((feed) => {
          return this.refreshFeed(feed.id);
        })
      );
    });
  }

  async refreshFeed(feedId: string) {
    return this.run(async () => {
      const sources = await db.source.findMany({ where: { feedId } });
      await Promise.all(
        sources.map((source) => {
          return this.refreshSource(source.id);
        })
      );
    });
  }

  async refreshSource(feedId: string) {
    return this.run(async () => {
      await RefreshSource(feedId);
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

export default new RefreshScheduler();
