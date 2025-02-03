import express from "express";
import { Feed } from "@virginia/core";

const app = express();
export default app;

const feed: Feed = [];

app.get("/", (req, res) => {
  res.json({ feed });
});
