import express, { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

const ASSETS_DIR = path.join(
  "/",
  "snapshot",
  "virginia",
  "apps",
  "web",
  "dist"
);

export default function frontend() {
  const staticMiddleware = express.static(ASSETS_DIR);
  return function frontendMiddleware(
    req: Request,
    res: Response,
    _next: NextFunction
  ) {
    return staticMiddleware(req, res, () => {
      if (req.path.startsWith("/api/")) {
        res.status(404).json({});
        return;
      }

      const index = path.join(ASSETS_DIR, "index.html");
      fs.createReadStream(index).pipe(res);
    });
  };
}
