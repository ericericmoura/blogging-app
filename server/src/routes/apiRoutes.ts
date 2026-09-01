import express from "express"
import markdownRoutes from "./markdownRoutes";

const apiV1Routes = express.Router();

apiV1Routes.use("/markdown", markdownRoutes);

export default apiV1Routes;