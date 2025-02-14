export default {
  client: "sqlite3",
  useNullAsDefault: true,
  migrations: {
    directory: "./src/migrations",
  },
  connection: {
    filename: "./dev.db",
  },
};
