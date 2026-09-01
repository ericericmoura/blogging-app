import express from "express";
import { createBlog, getAllBlogs } from "../controllers/blogController";
import { getAllBlogsQuery, markdownFileSchema } from "../validators/markdownValidators";
import validate from "express-zod-safe";
import { uploadMiddleware } from "../middlewares/uploadMiddleware";
import { env } from "../config/env";
import { validateFileMiddleware } from "../middlewares/validateFileMiddleware";
import { mbToBytes } from "../utils/fileSize";
import { authMiddleware } from "../middlewares/authMiddleware";

const blogRoutes = express.Router();

blogRoutes
  .post(
    "/",
    uploadMiddleware(mbToBytes(env.MAX_MARKDOWN_SIZE_MB)).single("markdown_file"),
    validateFileMiddleware(markdownFileSchema),
    authMiddleware(),
    createBlog,
  )
  .get("/", validate({ query: getAllBlogsQuery }), getAllBlogs);

export default blogRoutes;