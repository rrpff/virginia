import type { Item } from "@prisma/client";
import { GetSiteLatest } from "../adapters/index.js";
import db from "../db.js";

export async function RefreshSource(sourceId: string) {
  const source = await db.source.findFirst({ where: { id: sourceId } });
  if (!source) {
    console.error(`Unable to refresh unknown source: ${sourceId}`);
    return;
  }

  let items: Omit<Item, "id" | "sourceId">[] = [];
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
