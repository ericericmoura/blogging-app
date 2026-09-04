import jwt from "jsonwebtoken"
import { env } from "../config/env";

type JWTPayload = { id: number };

export const generateJWT = (payload: JWTPayload): string => {
    return jwt.sign(payload, env.JWT_SECRET);
}

export const verifyJWT = (token: string): JWTPayload => {
    return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
}