/*
  Warnings:

  - You are about to drop the column `image_url` on the `FeedItem` table. All the data in the column will be lost.
  - Added the required column `feedId` to the `FeedItem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FeedItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "feedId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "timestamp" DATETIME NOT NULL,
    CONSTRAINT "FeedItem_feedId_fkey" FOREIGN KEY ("feedId") REFERENCES "Feed" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FeedItem" ("description", "id", "timestamp", "title", "url") SELECT "description", "id", "timestamp", "title", "url" FROM "FeedItem";
DROP TABLE "FeedItem";
ALTER TABLE "new_FeedItem" RENAME TO "FeedItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
