import knex from "knex";
import { DATABASE_URL } from "./db.js";

const migrator = knex({
  client: "sqlite3",
  useNullAsDefault: true,
  connection: {
    filename: DATABASE_URL,
  },
});

export default async function migrate() {
  await migrator.migrate.latest({
    migrationSource: new ImportMigrationSource(),
  });
}

class ImportMigrationSource {
  async getMigrations() {
    return Promise.resolve(["init"]);
  }

  getMigrationName(migration: string) {
    return migration;
  }

  async getMigration(migration: string) {
    switch (migration) {
      case "init": {
        return await import("./migrations/20250214013438_init.js");
      }
      default: {
        throw new Error("invalid migration");
      }
    }
  }
}
