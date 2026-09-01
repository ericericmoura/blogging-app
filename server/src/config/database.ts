import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { env } from "./env";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const prisma = new PrismaClient({
  log:
    env.NODE_ENV === "development"
      ? ["info", "warn", "error"]
      : ["info", "error"],
  adapter,
});

const connectToDatabase = async () => {
  try {
    console.log("Connecting to the database...");
    await prisma.$connect();
    console.log("Successfully connected to the database.");
  } catch (error) {
    console.log(`Error while connecting to the database: ${error}`);
    process.exit(1);
  }
};

const disconnectFromDatabase = async () => {
  console.log("Disconnecting from the database...");
  await prisma.$disconnect();
};

export { prisma, connectToDatabase, disconnectFromDatabase };
