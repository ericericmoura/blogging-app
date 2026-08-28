import { Response, Request, NextFunction } from "express";
import z, { ZodType } from "zod";
import { AppError } from "../classes/AppError";

export const validateFileMiddleware = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.file)
    {
        return next(new AppError("no file was uploaded", 404));
    }
    const result = schema.safeParse(req.file);
    if (!result.success)
    {
        const issues = Object.entries(result.error.flatten().fieldErrors).map(
          (key) => {
            return `${key[0]} error: ${key[1]}`;
          },
        ).join(", ");

        return next(new AppError(`Invalid file. ${issues}`, 400));
    }
    next();
  };
};
