import express, { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

export default function frontend(dir: string) {
  console.info("SERVING FROM", dir);
  const staticMiddleware = express.static(dir);
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

      const index = path.join(dir, "index.html");
      fs.createReadStream(index).pipe(res);
    });
  };
}
