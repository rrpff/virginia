import knex from "knex";
import { DATABASE_URL } from "./db.js";

const migrator = knex({
  client: "better-sqlite3",
  useNullAsDefault: true,
  migrations: {
    directory: "./migrations/apps/server/migrations", // TODO: omg clean up + fix xplatform
  },
  connection: {
    filename: DATABASE_URL,
  },
});

export default async function migrate() {
  console.log("MIGRATING");
  await migrator.migrate.latest({
    migrationSource: new ImportMigrationSource(),
  });
  console.log("MIGRATED!!!");
}

// type ArgTypes<T> = T extends (arg: infer A) => void ? A : never;
// type MigrationSource = NonNullable<
//   NonNullable<ArgTypes<typeof migrator.migrate.latest>>["migrationSource"]
// >;

import * as migration_init from "./migrations/20250214013438_init.js";
class ImportMigrationSource {
  async getMigrations() {
    return Promise.resolve(["init"]);
  }

  getMigrationName(migration: string) {
    return migration;
  }

  async getMigration(migration: string) {
    switch (migration) {
      case "init":
        return migration_init;
      default: {
        throw new Error("invalid migration");
      }
    }
  }
}
