import server from "./server";
export type { RPC } from "./server";
export type * from "./schema";

const HOST = process.env.HOST ?? "0.0.0.0";
const PORT = Number(process.env.PORT ?? 26541);

server.listen(PORT, HOST, () => {
  console.info(`Listening on http://${HOST}:${PORT}`);
});
