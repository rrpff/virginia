import express, { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

const PUBLIC_DIR = path.join(import.meta.dirname, "..", "public");
const staticMiddleware = express.static(PUBLIC_DIR);

export default function frontend() {
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

      const index = path.join(PUBLIC_DIR, "index.html");
      fs.createReadStream(index).pipe(res);
    });
  };
}

// if (process.env.NODE_ENV === "production") {

// }

// express.static(__dirname, {index: 'ipad.htm'})

// app.use(function (req, res, next) {

//   const middleware = express.static(__dirname, {index: 'ipad.htm'});

//   return res.
// })
