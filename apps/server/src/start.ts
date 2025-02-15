import { start } from "./index.js";

(async () => {
  const server = await start({
    host: process.env.HOST ?? "0.0.0.0",
    port: Number(process.env.PORT ?? 26541),
    migrateOnStart: process.env.NODE_ENV !== "development",
    refreshOnStart: process.env.NODE_ENV !== "development",
    serveFrontend: process.env.NODE_ENV !== "development",
    publicRoot:
      process.env.NODE_ENV !== "development"
        ? "/snapshot/virginia/apps/web/dist" // location within pkg binary
        : undefined,
  });

  server.log.on("info", (...args) => console.info(...args));
  server.log.on("warn", (...args) => console.warn(...args));
  server.log.on("error", (...args) => console.error(...args));
  server.log.on("log", (...args) => console.log(...args));
})();
