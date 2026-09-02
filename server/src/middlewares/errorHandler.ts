import { NextFunction, Response, Request } from "express";
import { AppError } from "../classes/AppError";
import { env } from "../config/env";
import { Prisma } from "../generated/prisma/client";

const errorHandlerMiddleware = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let message = err?.message || "Internal server error";
  let statusCode = err?.statusCode || 500;

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = (err.meta?.target as string[])?.join(", ");
      statusCode = 409;
      message = `A record with this ${target || "value"} already exists.`;
    }
    else if (err.code === "P2025") {
      const cause = (err.meta?.cause as string) || "Record not found.";
      statusCode = 404;
      message = cause;
    }
    else if (err.code === "P2003") {
      const field = (err.meta?.field_name as string) || "related record";
      statusCode = 400;
      message = `Invalid reference: ${field} does not exist.`;
    }
  }

  res.status(statusCode).json({
    statusCode,
    message,
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

const notFoundMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const message = `No endpoint found for path ${req.originalUrl}`;
  next(new AppError(message, 404));
}

export { errorHandlerMiddleware, notFoundMiddleware }