import { Response, Request, NextFunction } from "express";
import { ValidatedRequest } from "express-zod-safe";
import { getAllBlogsQuery } from "../validators/markdownValidators";
import { AppError } from "../classes/AppError";
import { s3 } from "../config/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../config/env";

const markdownFilesFolder = "blogs/markdown"

export const createBlog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {    
  if (req.auth === undefined)
  {
    return next(new AppError("Invalid credentials.", 401));
  }
  const {id} = req.auth;

  const command = new PutObjectCommand({
    Bucket: env.BUCKET_NAME,
    Key: `${markdownFilesFolder}/${req.file?.originalname}`,
    Body: req.file?.buffer,
    ContentType: req.file?.mimetype
  });

  await s3.send(command);
  
  console.log("md file: ", req.file); 
  
  res.status(501).json({message: "Not implemented."});
};

export const getAllBlogs = (
  req: ValidatedRequest<{ query: typeof getAllBlogsQuery }>,
  res: Response,
  next: NextFunction,
) => {
  res.status(500).json({message: "Not implemented."});
};

