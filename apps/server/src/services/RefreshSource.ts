import { GetAdapter } from "../adapters/index.js";
import { FeedItem, Site } from "../schema.js";
import db from "../db.js";
import { backOff } from "exponential-backoff";

export async function RefreshSource(sourceId: string) {
  const source = await db.source.findFirst({ where: { id: sourceId } });
  if (!source) {
    console.error(`Unable to refresh unknown source: ${sourceId}`);
    return;
  }

  const adapter = GetAdapter(source.url);

  let site: Site = {};
  // TODO: not every time lol
  try {
    site = await backOff(() => adapter.site(source.url), {
      numOfAttempts: 3,
      startingDelay: 100,
      timeMultiple: 5,
      jitter: "full",
    });
  } catch (err) {
    console.error(`Unable to fetch site meta for ${source.url}: ${err}`);
  }

  let items: Omit<FeedItem, "id" | "feedId">[] = [];
  try {
    items = await backOff(() => adapter.latest(source.url), {
      numOfAttempts: 3,
      startingDelay: 100,
      timeMultiple: 5,
      jitter: "full",
    });
  } catch (err) {
    console.error(`Unable to fetch items for ${source.url}: ${err}`);
  }

  await db.$transaction([
    db.item.deleteMany({ where: { sourceId: source.id } }),
    db.source.update({
      where: { id: source.id },
      data: {
        name: site.name ?? null,
        iconUrl: site.iconUrl ?? null,
        items: {
          createMany: {
            data: items.map((item) => {
              return {
                url: item.url ?? source.url, // TODO: what do i do here??? tilde town help
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
