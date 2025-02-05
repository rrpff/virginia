import { Feed as PrismaFeed } from "@prisma/client";
import { Adapter } from "../adapters/index.js";
import { PatreonAdapter } from "../adapters/patreon.js";
import { RSSAdapter } from "../adapters/rss.js";
import { YoutubeAdapter } from "../adapters/youtube.js";
import { FeedItem, Site } from "../schema.js";
import db from "../db.js";
import { backOff } from "exponential-backoff";

export async function RefreshFeed(feedId: string) {
  const feed = await db.feed.findFirst({ where: { id: feedId } });
  if (!feed) {
    console.error(`Unable to refresh unknown feed: ${feedId}`);
    return;
  }

  const adapter = getAdapter(feed);

  let site: Site = {};
  // TODO: not every time lol
  try {
    site = await backOff(() => adapter.site(feed.url), {
      numOfAttempts: 3,
      startingDelay: 100,
      timeMultiple: 5,
      jitter: "full",
    });
  } catch (err) {
    console.error(`Unable to fetch site meta for ${feed.url}: ${err}`);
  }

  let items: Omit<FeedItem, "id" | "feedId">[] = [];
  try {
    items = await backOff(() => adapter.feed(feed.url), {
      numOfAttempts: 3,
      startingDelay: 100,
      timeMultiple: 5,
      jitter: "full",
    });
  } catch (err) {
    console.error(`Unable to fetch items for ${feed.url}: ${err}`);
  }

  await db.$transaction([
    db.feedItem.deleteMany({ where: { feedId: feed.id } }),
    db.feed.update({
      where: { id: feed.id },
      data: {
        name: site.name ?? null,
        iconUrl: site.iconUrl ?? null,
        items: {
          createMany: {
            data: items.map((item) => {
              return {
                url: item.url ?? feed.url, // TODO: what do i do here??? tilde town help
                title: item.title,
                description: item.description,
                imageUrl: item.imageUrl,
                timestamp: new Date(item.timestamp),
              };
            }),
          },
        },
      },
    }),
  ]);
}

const ADAPTERS = [RSSAdapter, PatreonAdapter, YoutubeAdapter];

function getAdapter(feed: PrismaFeed): Adapter {
  const url = new URL(feed.url);
  const adapter = ADAPTERS.find((a) => a.hostname === url.hostname);
  return adapter ?? RSSAdapter;
}
