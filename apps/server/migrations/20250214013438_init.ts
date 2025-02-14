import type { Knex } from "knex";

const sql = (t: TemplateStringsArray) => t[0] ?? "";

// TODO: generate future migrations based on prisma migrations?

export async function up(knex: Knex): Promise<void> {
  await knex.raw(sql`
    CREATE TABLE "Feed" (
        "id" TEXT NOT NULL PRIMARY KEY
      , "name" TEXT
      , "iconUrl" TEXT
    );
  `);

  await knex.raw(sql`
    CREATE TABLE "Source" (
        "id" TEXT NOT NULL PRIMARY KEY
      , "feedId" TEXT NOT NULL
      , "url" TEXT NOT NULL
      , "name" TEXT
      , "iconUrl" TEXT
      , "lastId" TEXT
      , "lastHash" TEXT
      , "insertedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      , "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      , CONSTRAINT "Source_feedId_fkey" FOREIGN KEY ("feedId") REFERENCES "Feed" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

  await knex.raw(sql`
    CREATE TABLE "Item" (
        "id" TEXT NOT NULL PRIMARY KEY
      , "sourceId" TEXT NOT NULL
      , "url" TEXT NOT NULL
      , "title" TEXT NOT NULL
      , "description" TEXT
      , "imageUrl" TEXT
      , "timestamp" DATETIME NOT NULL
      , CONSTRAINT "Item_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

  await knex.raw(sql`
    CREATE TABLE "Category" (
        "id" TEXT NOT NULL PRIMARY KEY
      , "name" TEXT NOT NULL
      , "vanity" TEXT NOT NULL
      , "icon" TEXT NOT NULL
      , "position" INTEGER NOT NULL
    );
  `);

  await knex.raw(sql`
    CREATE TABLE "_CategoryToFeed" (
        "A" TEXT NOT NULL
      , "B" TEXT NOT NULL
      , CONSTRAINT "_CategoryToFeed_A_fkey" FOREIGN KEY ("A") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      , CONSTRAINT "_CategoryToFeed_B_fkey" FOREIGN KEY ("B") REFERENCES "Feed" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

  await knex.raw(sql`
    CREATE UNIQUE INDEX "_CategoryToFeed_AB_unique" ON "_CategoryToFeed" ("A", "B");
  `);

  await knex.raw(sql`
    CREATE INDEX "_CategoryToFeed_B_index" ON "_CategoryToFeed" ("B");
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(sql`DROP TABLE "Item";`);
  await knex.raw(sql`DROP TABLE "Source";`);
  await knex.raw(sql`DROP TABLE "Feed";`);
  await knex.raw(sql`DROP TABLE "Category";`);
  await knex.raw(sql`DROP TABLE "_CategoryToFeed";`);
  await knex.raw(sql`DROP INDEX "_CategoryToFeed_AB_unique";`);
  await knex.raw(sql`DROP INDEX "_CategoryToFeed_B_index";`);
}
