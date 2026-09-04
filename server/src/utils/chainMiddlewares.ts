import { RequestHandler } from "express";

export const chain = (...handlers: RequestHandler<any, any, any, any>[]): RequestHandler<{}>[] =>
    handlers as RequestHandler<{}>[];