import { Request, Response } from "express";
import RefreshScheduler from "../schedulers/RefreshScheduler.js";
import { ServerEvent } from "../schema.js";

export default function sse() {
  return function sseMiddleware(_req: Request, res: Response) {
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const send = (event: ServerEvent) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    const started = () => send({ type: "refresh-started" });
    const ended = () => send({ type: "refresh-ended" });
    const updated = (feedId: string) => send({ type: "feed-updated", feedId });

    RefreshScheduler.on("refresh-started", started);
    RefreshScheduler.on("refresh-ended", ended);
    RefreshScheduler.on("feed-updated", updated);

    res.on("close", () => {
      RefreshScheduler.off("refresh-started", started);
      RefreshScheduler.off("refresh-ended", ended);
      RefreshScheduler.off("feed-updated", updated);
      res.end();
    });
  };
}
