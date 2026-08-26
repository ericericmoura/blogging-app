import "./config/env"
import express from "express"
import morgan from "morgan";
import cors from "cors";
import { errorHandlerMiddleware, notFoundMiddleware } from "./middlewares/errorHandler";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());



app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = parseInt(process.env.PORT || "3000");

app.listen(port, () => {
    console.log(`🔥 App running at http://localhost:${port}.`);
});