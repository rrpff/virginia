import { FeedItem, Site } from "../schema.js";
import db from "../db.js";
import { GetSiteLatest, GetSiteMeta } from "../adapters/index.js";

export async function RefreshSource(sourceId: string) {
  const source = await db.source.findFirst({ where: { id: sourceId } });
  if (!source) {
    console.error(`Unable to refresh unknown source: ${sourceId}`);
    return;
  }

  let site: Site = {};
  // TODO: not every time lol
  try {
    site = await GetSiteMeta(source.url);
  } catch (err) {
    console.error(`Unable to fetch site meta for ${source.url}: ${err}`);
  }

  let items: Omit<FeedItem, "id" | "feedId">[] = [];
  try {
    items = await GetSiteLatest(source.url);
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
