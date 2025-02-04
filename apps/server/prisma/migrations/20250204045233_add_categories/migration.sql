-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Feed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "categories" TEXT NOT NULL DEFAULT '',
    "name" TEXT,
    "iconUrl" TEXT
);
INSERT INTO "new_Feed" ("iconUrl", "id", "name", "url") SELECT "iconUrl", "id", "name", "url" FROM "Feed";
DROP TABLE "Feed";
ALTER TABLE "new_Feed" RENAME TO "Feed";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
