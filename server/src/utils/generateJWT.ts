import jwt from "jsonwebtoken"
import { env } from "../config/env";
import { AuthPayload } from "../types/express";

export const generateJWT = (payload: AuthPayload): string => {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN_SECONDS });
}