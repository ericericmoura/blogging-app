import "./config/env"
import express from "express"
import morgan from "morgan";
import cors from "cors";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

const port = parseInt(process.env.PORT || "3000");

app.get("/", (_req, res) => {
    res.status(200).json({message: "Welcome to the blogging app REST API."});
})

app.listen(port, () => {
    console.log(`🔥 App running at http://localhost:${port}.`);
});