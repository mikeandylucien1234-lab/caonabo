import { PrismaClient } from "@prisma/client";

// Singleton Prisma — évite d'épuiser les connexions en dev (hot-reload) et en
// serverless (Vercel). En production Supabase, utiliser la connexion poolée
// (pgBouncer, port 6543) via DATABASE_URL.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
