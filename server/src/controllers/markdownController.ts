import { Response, Request, NextFunction } from "express";
import { ValidatedRequest } from "express-zod-safe";
import { getAllMarkdownQuery } from "../validators/markdownValidators";
import { prisma } from "../config/database";
import { AppError } from "../classes/AppError";

export const createMarkdown = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {    
  if (req.auth === undefined)
  {
    return next(new AppError("Invalid credentials.", 401));
  }
  const {id} = req.auth;
  
  console.log("md file: ", req.file); 
  
  res.status(501).json({message: "Not implemented."});
};

export const getAllMarkdown = (
  req: ValidatedRequest<{ query: typeof getAllMarkdownQuery }>,
  res: Response,
  next: NextFunction,
) => {
  res.status(500).json({message: "Not implemented."});
};

