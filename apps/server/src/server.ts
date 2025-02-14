import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import RefreshScheduler from "./schedulers/RefreshScheduler.js";
import frontend from "./middleware/frontend.js";
import sse from "./middleware/sse.js";
import rpc from "./routers/rpc.js";
import { Config } from "./config.js";
import log from "./log.js";

export type RPC = typeof rpc;
export function createServer(config: Config) {
  const app = express();

  app.use(cors());

  app.use(
    "/rpc",
    createExpressMiddleware({
      router: rpc,
      onError({ error }) {
        log.error("Error:", error);
      },
    })
  );

  app.post("/api/refresh", (_req, res) => {
    RefreshScheduler.refreshAll();
    res.status(202).send({});
  });

  app.get("/sse", sse());

  if (config.serveFrontend) {
    if (!config.publicRoot) {
      throw new Error("serveFrontend is set but publicRoot isn't!");
    }

    app.use(frontend(config.publicRoot));
  }

  return app;
}
