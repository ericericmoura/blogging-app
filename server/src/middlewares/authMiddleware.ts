import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/database";
import { AppError } from "../classes/AppError";
import jwt from "jsonwebtoken"
import { AuthPayload } from "../types/express";
import { env } from "../config/env";
import { Prisma, Roles } from "../generated/prisma/client";

export const authMiddleware = (requiredRole: Roles = Roles.ADMIN, requireConfirmedEmail = true) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        if (!req.headers.authorization)
        {
            return next(new AppError("No token provided.", 401));
        }
        const token = req.headers.authorization.split(" ")[1];
        try {
            req.auth = (jwt.verify(token, env.JWT_SECRET) as AuthPayload);

            if (req.auth.role != requiredRole && requiredRole == Roles.ADMIN)
            {
                return next(new AppError("You don't have permission to access this endpoint.", 403));
            }

            const user = await prisma.user.findUniqueOrThrow({where: {id: req.auth.id}});

            if (requireConfirmedEmail && !user?.confirmedEmail)
            {
                return next(new AppError("Access forbidden. Please, confirm your e-mail address.", 403));
            }
            next();
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError)
            {
                return next(new AppError("Account not found. It's either invalid or was deleted.", 404));
            }            
            return next(new AppError("Invalid token.", 401));
        }
    }
}