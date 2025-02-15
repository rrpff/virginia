import schedule from "node-schedule";
import { killPortProcess } from "kill-port-process";
import RefreshScheduler from "./schedulers/RefreshScheduler.js";
import migrate from "./migrate.js";
import { createServer } from "./server.js";
import { Config } from "./config.js";
import log from "./log.js";

export async function start(config: Config) {
  // Kill any existing servers
  await killPortProcess(config.port);

  if (config.migrateOnStart) {
    // Apply any database migrations
    await migrate();
  }

  if (config.refreshOnStart) {
    // Schedule a refresh immediately
    RefreshScheduler.refreshAll();
  }

  // Schedule a refresh every 30 minutes
  schedule.scheduleJob("0,30 * * * *", () => RefreshScheduler.refreshAll());

  // Start the web server
  const server = createServer(config);
  server.listen(config.port, config.host, () => {
    log.info(`Listening on http://${config.host}:${config.port}`);
  });

  return { log };
}
