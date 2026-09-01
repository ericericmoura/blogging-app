import express from "express";
import morgan from "morgan";
import cors from "cors";
import {
  errorHandlerMiddleware,
  notFoundMiddleware,
} from "./middlewares/errorHandler";
import { connectToDatabase, disconnectFromDatabase } from "./config/database";
import { env } from "./config/env";
import helmet from "helmet";
import apiV1Routes from "./routes/apiRoutes";

connectToDatabase();

const app = express();

app.use(helmet({}));
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/v1", apiV1Routes);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const server = app.listen(env.PORT, () => {
  console.log(`🔥 App running at http://localhost:${env.PORT}.`);
});

process.on("uncaughtException", async (err) => {
  console.log(`Uncaught exception: ${err}`);
  await disconnectFromDatabase();
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.log(`Unhandled rejection: ${err}`);
  server.close(async () => {
    await disconnectFromDatabase();
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  server.close(async () => {
    await disconnectFromDatabase();
    process.exit(0);
  });
});
