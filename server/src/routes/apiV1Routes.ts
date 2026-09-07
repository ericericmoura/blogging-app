import express, { Response } from "express"
import blogRoutes from "./blogRoutes";
import authRoutes from "./authRoutes";

const apiV1Routes = express.Router();

apiV1Routes.get("/", (_, res: Response) => { res.status(200).json({ message: "Welcome to the blogging-app API v1." }) });
apiV1Routes.use("/blogs", blogRoutes);
apiV1Routes.use("/auth", authRoutes);

export default apiV1Routes;