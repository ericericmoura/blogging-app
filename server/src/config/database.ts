import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
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
