import server from "./server.js";

const HOST = process.env.HOST ?? "0.0.0.0";
const PORT = Number(process.env.PORT ?? 26541);

server.listen(PORT, HOST, () => {
  console.info(`Listening on http://${HOST}:${PORT}`);
});
