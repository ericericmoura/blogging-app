import express from "express"
import { register } from "../controllers/authController";
import validate from "express-zod-safe";
import { registerValidator } from "../validators/authValidators";

const authRoutes = express.Router();

authRoutes.post("/register", validate({ body: registerValidator }), register);

export default authRoutes;