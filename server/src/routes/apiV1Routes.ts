import express from "express"
import blogRoutes from "./blogRoutes";
import authRoutes from "./authRoutes";

const apiV1Routes = express.Router();

apiV1Routes.use("/blogs", blogRoutes);
apiV1Routes.use("/auth", authRoutes);

export default apiV1Routes;