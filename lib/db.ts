import { PrismaClient } from "@prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const db: PrismaClient = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  global.prisma = db
}


