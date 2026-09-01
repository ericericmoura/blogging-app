import express from "express"
import blogRoutes from "./blogRoutes";

const apiV1Routes = express.Router();

apiV1Routes.use("/blogs", blogRoutes);

export default apiV1Routes;