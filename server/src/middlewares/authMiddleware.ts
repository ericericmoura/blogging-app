import { NextFunction, Request, Response } from "express";
import { Roles } from "../generated/prisma/enums";
import { prisma } from "../config/database";
import { AppError } from "../classes/AppError";

export const authMiddleware = (requireConfirmedEmail = true) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        const adminId = 1;

        req.auth = {
            id: adminId,
            role: Roles.ADMIN
        };

        const user = await prisma.user.findUnique({where: {id: adminId}});
        console.log(user);
        
        if (requireConfirmedEmail && !user?.confirmedEmail)
        {
            next(new AppError("Access forbidden. Please, confirm your e-mail address.", 403));
        }
        
        next();
    }
}