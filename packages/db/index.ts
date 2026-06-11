/* eslint-disable no-var */
import { PrismaClient } from "@prisma/client";
import { softDeleteExtension } from "./extensions";

const extendedPrisma = new PrismaClient({
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
