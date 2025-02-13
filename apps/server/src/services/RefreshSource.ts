import { Source } from "@prisma/client";
import { GetSiteLatest, SourceItem } from "../adapters/index.js";
import db from "../db.js";

export async function RefreshSource(sourceId: string) {
  const source = await db.source.findFirst({ where: { id: sourceId } });
  if (!source) {
    console.error(`Unable to refresh unknown source: ${sourceId}`);
    return;
  }

  let items: SourceItem[] = [];
  try {
    items = await GetSiteLatest(source.url);
  } catch (err) {
    console.error(`Unable to fetch items for ${source.url}: ${err}`);
  }

  const latest = getLatestItems(source, items);

  // If there are no new items, make no changes
  if (latest.length === 0) {
    return;
  }

  await db.$transaction([
    db.source.update({
      where: { id: source.id },
      data: {
        lastId: latest[0]?.id,
        lastHash: latest[0]?.hash,
        updatedAt: new Date(),
        items: {
          createMany: {
            data: latest.map((item) => {
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

function getLatestItems(source: Source, items: SourceItem[]): SourceItem[] {
  // If last id is present, use it to filter posts
  if (source.lastId !== null) {
    const filtered: SourceItem[] = [];
    for (let item of items) {
      if (item.id === source.lastId) {
        console.log(
          `Found ${filtered.length} new items for ${source.url} using id`
        );
        return filtered;
      } else {
        filtered.push(item);
      }
    }

    console.log(`Did not find id for ${source.url}`);
    return filtered;
  }

  // If last id is missing, fallback to identifying posts
  // by a hash
  if (source.lastHash !== null) {
    const filtered: SourceItem[] = [];
    for (let item of items) {
      if (item.hash === source.lastHash) {
        console.log(
          `Found ${filtered.length} new items for ${source.url} using hash`
        );
        return filtered;
      } else {
        filtered.push(item);
      }
    }

    console.log(`Did not find hash for ${source.url}`);
    return filtered;
  }

  // Otherwise assume it's a first run and return everything
  console.log("returning everything for ", source.url);
  return items;
}
