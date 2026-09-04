import z from "zod";
import { env } from "../config/env";
import { mbToBytes } from "../utils/fileSize";
import { $Enums } from "../generated/prisma/client";

export const getAllBlogsQuery = z.object({
  userId: z.coerce.number().int().positive().optional(),
  blogsPerPage: z.coerce.number().int().positive().max(100).default(10),
  currentPage: z.coerce.number().int().positive().default(1),
  orderByCreationDate: z.enum(["asc", "desc"]).default("desc"),
  title: z.string().min(3).optional()
});

export const createBlogBody = z.object({
  title: z.string().min(2).max(500),
  status: z.enum($Enums.BlogStatus).default($Enums.BlogStatus.DRAFT)
});

export const updateBlogBody = z.object({
  title: z.string().min(2).max(500).optional(),
  status: z.enum($Enums.BlogStatus).optional()
});

export const markdownFileSchema = z.object({
  originalname: z
    .string()
    .regex(/\.(md|markdown)$/i, "Must be a .md or .markdown file"),
  mimetype: z.string(),
  size: z
    .number()
    .max(mbToBytes(env.MAX_MARKDOWN_SIZE_MB), `File must be under ${env.MAX_MARKDOWN_SIZE_MB}MB`,
    ),
  buffer: z.instanceof(Buffer),
});