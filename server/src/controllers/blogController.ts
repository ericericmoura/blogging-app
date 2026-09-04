import { Response, Request, NextFunction } from "express";
import { ValidatedRequest } from "express-zod-safe";
import { createBlogBody, getAllBlogsQuery } from "../validators/blogValidators";
import { AppError } from "../classes/AppError";
import { s3 } from "../config/s3";
import { Bucket$, DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../config/env";
import { prisma } from "../config/database";
import { slugify } from "../utils/slugify";
import { getTotalPages, paginate } from "../utils/paginate";
import { Prisma, Roles } from "../generated/prisma/client";
import { idParams } from "../validators/genericValidators"
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

  await s3.send(putCommand);

  try {
    const blog = await prisma.blog.create({
      data: {
        title,
        status,
        slug: slugify(title),
        userId: id,
        markdownKey: fileKey
      }
    });

    res.status(201).json({ message: "Blog successfully created", data: blog });
  } catch (error: any) {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: fileKey
    });

    await s3.send(deleteCommand)
      .catch(err => {
        if (env.NODE_ENV === "development") console.error(`Failed to delete file from AWS: ${err}`);
      });

    next(error);
  }
};

export const getAllBlogs = async (
  req: ValidatedRequest<{ query: typeof getAllBlogsQuery }>,
  res: Response
) => {
  const { blogsPerPage, currentPage, orderByCreationDate, title, userId } = req.query;

  const where: Prisma.BlogWhereInput = {
    ...(userId !== undefined && { userId }),
    ...(title !== undefined && { title: { contains: title, mode: "insensitive" } }),
  };

  const skip = paginate(blogsPerPage, currentPage);

  const [blogsCount, blogs] = await Promise.all([
    prisma.blog.count({ where }),
    prisma.blog.findMany({
      where,
      skip,
      take: blogsPerPage,
      orderBy: {
        createdAt: orderByCreationDate
      }
    })
  ])

  const totalPages = getTotalPages(blogsCount, blogsPerPage);

  res.status(200).json({
    message: "Successfully retrieved all blogs.",
    data: blogs,
    blogsCount,
    currentPage,
    blogsPerPage,
    totalPages
  });
};

export const deleteBlog = async (
  req: ValidatedRequest<{ params: typeof idParams }>,
  res: Response
) => {
  const { id } = req.params;

  const where = { id };

  const blog = await prisma.blog.findUniqueOrThrow({ where });

  const deleteCommand = new DeleteObjectCommand({
    Bucket: env.BUCKET_NAME,
    Key: blog.markdownKey
  })

  await prisma.blog.delete({ where });
  await s3.send(deleteCommand);

  res.status(200).json({ message: "Blog successfully deleted." });
}

export const getBlogById = async (
  req: ValidatedRequest<{ params: typeof idParams }>,
  res: Response
) => {
  const { id } = req.params;

  const blog = await prisma.blog.findUniqueOrThrow({ where: { id } });

  const getCommand = new GetObjectCommand({
    Bucket: env.BUCKET_NAME,
    Key: blog.markdownKey
  })

  const presignedUrl = await getSignedUrl(s3, getCommand, { expiresIn: 3600 });

  res.status(200).json({ message: "Successfully found blog.", data: { ...blog, markdownPresignedUrl: presignedUrl } });
}

export const updateBlog = async (
  req: ValidatedRequest<{ body: typeof createBlogBody, params: typeof idParams }>,
  res: Response,
  next: NextFunction
) => {
  if (req.auth === undefined) {
    return next(new AppError("Invalid credentials.", 401));
  }
  const { title, status } = req.body;
  const { id: userId, role } = req.auth;

  const { id } = req.params;

  const blogExists = await prisma.blog.findUniqueOrThrow({ where: { id } });

  if (role !== Roles.ADMIN && userId !== blogExists.userId) {
    return next(new AppError("This blog does not belong to you.", 403));
  }

  let updateData: Prisma.BlogUpdateInput =
  {
    ...(title !== undefined && { title }),
    ...(status !== undefined && { status })
  };

  if (req.file !== undefined)
  {
    const fileKey = `${markdownFilesFolder}/${crypto.randomUUID()}.md`;
  
    const putCommand = new PutObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: fileKey,
      Body: req.file?.buffer,
      ContentType: req.file?.mimetype
    });
  
    const deleteCommand = new DeleteObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: blogExists.markdownKey
    })
  
    await Promise.allSettled([
      s3.send(deleteCommand),
      s3.send(putCommand)
    ]);
  
    updateData.markdownKey = fileKey;
  }

  const blog = await prisma.blog.update(
    { where: { id }, data: updateData, select: { title: true, status: true, slug: true } });

  res.status(200).json({ message: "successfully updated blog.", data: blog });
}