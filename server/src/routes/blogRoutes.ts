import express from "express";
import { createBlog, deleteBlog, getAllBlogs, getBlogById } from "../controllers/blogController";
import { createBlogBody, getAllBlogsQuery, markdownFileSchema } from "../validators/blogValidators";
import validate from "express-zod-safe";
import { uploadMiddleware } from "../middlewares/uploadMiddleware";
import { env } from "../config/env";
import { validateFileMiddleware } from "../middlewares/validateFileMiddleware";
import { mbToBytes } from "../utils/fileSize";
import { authMiddleware } from "../middlewares/authMiddleware";
import { idParams } from "../validators/genericValidators";

const blogRoutes = express.Router();

blogRoutes
  .post(
    "/",
    authMiddleware(),
    uploadMiddleware(mbToBytes(env.MAX_MARKDOWN_SIZE_MB)).single("markdown_file"),
    validateFileMiddleware(markdownFileSchema),
    validate({body: createBlogBody}),
    createBlog,
  )
  .get("/", validate({ query: getAllBlogsQuery }), getAllBlogs)
  .get("/:id", validate({params: idParams}), getBlogById)
  .delete("/:id", validate({ params: idParams }), deleteBlog);

export default blogRoutes;