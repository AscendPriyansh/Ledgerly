import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";

const server = app.listen(env.PORT, "0.0.0.0", () => {
  console.info(`MiniLedger API listening on http://localhost:${env.PORT}`);
});

async function shutdown(signal: string) {
  console.info(`${signal} received; shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
