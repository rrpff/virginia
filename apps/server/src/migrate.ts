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
  await migrator.migrate.latest();
}
