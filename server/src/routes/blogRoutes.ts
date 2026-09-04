import express, { RequestHandler } from "express";
import { createBlog, deleteBlog, getAllBlogs, getBlogById, updateBlog } from "../controllers/blogController";
import { createBlogBody, getAllBlogsQuery, markdownFileSchema, updateBlogBody } from "../validators/blogValidators";
import validate from "express-zod-safe";
import { uploadMiddleware } from "../middlewares/uploadMiddleware";
import { env } from "../config/env";
import { validateFileMiddleware } from "../middlewares/validateFileMiddleware";
import { mbToBytes } from "../utils/fileSize";
import { authMiddleware } from "../middlewares/authMiddleware";
import { idParams } from "../validators/genericValidators";
import { Roles } from "../generated/prisma/enums";
import { chain } from "../utils/chainMiddlewares";

const blogRoutes = express.Router();

blogRoutes
  .post(
    "/",
    ...chain(
      authMiddleware(Roles.USER, true),
      uploadMiddleware(mbToBytes(env.MAX_MARKDOWN_SIZE_MB)).single("markdown_file"),
      validateFileMiddleware(markdownFileSchema),
    ),
    validate({ body: createBlogBody }),
    createBlog,
  )
  .get("/", validate({ query: getAllBlogsQuery }), getAllBlogs)
  .get(
    "/:id",
    validate({ params: idParams }),
    authMiddleware(Roles.USER, true) as RequestHandler<any>,
    getBlogById)
  .put(
    "/:id",
    ...chain(
      authMiddleware(Roles.USER, true),
      uploadMiddleware(mbToBytes(env.MAX_MARKDOWN_SIZE_MB)).single("markdown_file"),
      validateFileMiddleware(markdownFileSchema, true),
    ),
    validate({ params: idParams, body: updateBlogBody }),
    updateBlog
  )
  .delete(
    "/:id",
    authMiddleware(Roles.ADMIN, true) as RequestHandler<any>,
    validate({ params: idParams }),
    deleteBlog);

export default blogRoutes;