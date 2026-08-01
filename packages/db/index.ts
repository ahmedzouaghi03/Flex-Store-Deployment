/* eslint-disable no-var */
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";
import { softDeleteExtension } from "./extensions";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(pool);

const extendedPrisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
}).$extends(softDeleteExtension);

declare global {
  var db: typeof extendedPrisma | undefined;
}

export const db = global.db ?? extendedPrisma;

export * from "@prisma/client";

if (process.env.NODE_ENV !== "production") {
  globalThis.db = db;
}
