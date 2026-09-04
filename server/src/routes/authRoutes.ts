import express, { NextFunction, Request, Response } from "express"
import { login, register } from "../controllers/authController";
import validate from "express-zod-safe";
import { loginValidator, registerValidator } from "../validators/authValidators";
import { authMiddleware } from "../middlewares/authMiddleware";
import { Roles } from "../generated/prisma/enums";

const authRoutes = express.Router();

authRoutes
    .post("/register", validate({ body: registerValidator }), register)
    .post("/login", validate({ body: loginValidator }), login)
    .get("/admin", authMiddleware(Roles.ADMIN, false), (_req: Request, res: Response) => res.status(200).json({message: "Welcome, administrator!"}))
    .get("/user", authMiddleware(Roles.USER, false), (_req: Request, res: Response) => res.status(200).json({ message: "Welcome, regular user!" }))

export default authRoutes;