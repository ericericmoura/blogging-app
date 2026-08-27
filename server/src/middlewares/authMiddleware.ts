import { NextFunction, Request, Response } from "express";
import { Roles } from "../generated/prisma/enums";

export const authMiddleware = () => {
    return (req: Request, _res: Response, next: NextFunction) => {
        req.auth = {
            id: 1,
            role: Roles.ADMIN
        };

        next();
    }
}