import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import RefreshScheduler from "./schedulers/RefreshScheduler.js";
import frontend from "./middleware/frontend.js";
import sse from "./middleware/sse.js";
import rpc from "./routers/rpc.js";

const app = express();

app.use(cors());

app.use(
  "/rpc",
  createExpressMiddleware({
    router: rpc,
    onError({ error }) {
      console.error("Error:", error);
    },
  })
);

app.post("/api/refresh", (_req, res) => {
  RefreshScheduler.refreshAll();
  res.status(202).send({});
});

app.get("/sse", sse());

if (process.env.NODE_ENV === "production") {
  app.use(frontend());
}

export default app;
export type RPC = typeof rpc;
