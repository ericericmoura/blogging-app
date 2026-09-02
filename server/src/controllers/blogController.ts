import { Response, Request, NextFunction } from "express";
import { ValidatedRequest } from "express-zod-safe";
import { createBlogBody, getAllBlogsQuery } from "../validators/markdownValidators";
import { AppError } from "../classes/AppError";
import { s3 } from "../config/s3";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../config/env";
import { prisma } from "../config/database";
import { slugify } from "../utils/slugify";
import { BlogModel } from "../generated/prisma/models"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const markdownFilesFolder = "blogs/markdown"

export const createBlog = async (
  req: ValidatedRequest<{ body: typeof createBlogBody }>,
  res: Response,
  next: NextFunction,
) => {
  if (req.auth === undefined) {
    return next(new AppError("Invalid credentials.", 401));
  }

  const { id } = req.auth;
  const { title, status } = req.body;

  const fileKey = `${markdownFilesFolder}/${crypto.randomUUID()}.md`;

  const putCommand = new PutObjectCommand({
    Bucket: env.BUCKET_NAME,
    Key: fileKey,
    Body: req.file?.buffer,
    ContentType: req.file?.mimetype
  });

  const [_cmdResult, user] = await Promise.all([
    s3.send(putCommand),
    prisma.user.findUniqueOrThrow({where: {id}})
  ]);

  try {
    const blog = await prisma.blog.create({
      data: {
        title,
        status,
        slug: slugify(`${title} by ${user.username}`),
        userId: id,
        markdownKey: fileKey
      }
    });

    const getCommand = new GetObjectCommand({
      Key: blog.markdownKey,
      Bucket: env.BUCKET_NAME
    });

    const url = await getSignedUrl(s3, getCommand, { expiresIn: 3600 });

    res.status(201).json({ message: "Blog successfully created", data: { ...blog, markdownFileUrl: url} });
  } catch (error) {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: fileKey
    });

    await s3.send(deleteCommand);

    next(error);
  }
};

export const getAllBlogs = (
  req: ValidatedRequest<{ query: typeof getAllBlogsQuery }>,
  res: Response,
  next: NextFunction,
) => {
  res.status(500).json({ message: "Not implemented." });
};

