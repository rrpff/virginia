import schedule from "node-schedule";
import RefreshScheduler from "./schedulers/RefreshScheduler.js";
import server from "./server.js";
import migrate from "./migrate.js";

const HOST = process.env.HOST ?? "0.0.0.0";
const PORT = Number(process.env.PORT ?? 26541);

(async () => {
  if (process.env.NODE_ENV === "production") {
    // Apply any database migrations
    await migrate();

    // Schedule a refresh immediately
    RefreshScheduler.refreshAll();
  }

  // Schedule a refresh every 30 minutes
  schedule.scheduleJob("0,30 * * * *", () => RefreshScheduler.refreshAll());

  // Start the web server
  server.listen(PORT, HOST, () => {
    console.info(`Listening on http://${HOST}:${PORT}`);
  });
})();
