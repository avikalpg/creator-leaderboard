import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getActiveDatabaseUrl(): string | undefined {
  const dbType = (process.env.DB_TYPE || "").toLowerCase().trim();
  if (dbType === "postgres" || dbType === "postgresql") {
    return process.env.POSTGRES_DATABASE_URL || process.env.DATABASE_URL;
  }
  if (dbType === "sqlite") {
    return process.env.SQLITE_DATABASE_URL || process.env.DATABASE_URL || "file:./dev.db";
  }
  return process.env.POSTGRES_DATABASE_URL || process.env.DATABASE_URL || process.env.SQLITE_DATABASE_URL;
}

const activeUrl = getActiveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: activeUrl ? { db: { url: activeUrl } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
