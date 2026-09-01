import z from "zod";
import { env } from "../config/env";
import { mbToBytes } from "../utils/fileSize";

export const getAllBlogsQuery = z.object({
  blogId: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().min(10).max(100).default(10),
  orderByCreationDate: z.enum(["asc", "desc"]).optional()
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