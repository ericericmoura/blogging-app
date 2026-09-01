import { NextFunction, Response, Request } from "express";
import { AppError } from "../classes/AppError";

const errorHandlerMiddleware = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const message     = err?.message    || "Internal server error";
  const statusCode  = err?.statusCode || 500;

  res.status(statusCode).json({
    statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

const notFoundMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
    const message = `No endpoint found for path ${req.originalUrl}`;
    next(new AppError(message, 404));
}

export {errorHandlerMiddleware, notFoundMiddleware}