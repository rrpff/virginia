/*
  Warnings:

  - You are about to drop the column `url` on the `Source` table. All the data in the column will be lost.
  - Added the required column `feedUrl` to the `Source` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalUrl` to the `Source` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Source" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "feedId" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "feedUrl" TEXT NOT NULL,
    "name" TEXT,
    "iconUrl" TEXT,
    CONSTRAINT "Source_feedId_fkey" FOREIGN KEY ("feedId") REFERENCES "Feed" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Source" ("feedId", "iconUrl", "id", "name") SELECT "feedId", "iconUrl", "id", "name" FROM "Source";
DROP TABLE "Source";
ALTER TABLE "new_Source" RENAME TO "Source";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
