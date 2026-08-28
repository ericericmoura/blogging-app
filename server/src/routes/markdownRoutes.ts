import express from "express";
import { createMarkdown, getAllMarkdown } from "../controllers/markdownController";
import { getAllMarkdownQuery, markdownFileSchema } from "../validators/markdownValidators";
import validate from "express-zod-safe";
import { uploadMiddleware } from "../middlewares/uploadMiddleware";
import { env } from "../config/env";
import { validateFileMiddleware } from "../middlewares/validateFileMiddleware";
import { mbToBytes } from "../utils/fileSize";
import { authMiddleware } from "../middlewares/authMiddleware";

const markdownRoutes = express.Router();

markdownRoutes
  .post(
    "/",
    uploadMiddleware(mbToBytes(env.MAX_MARKDOWN_SIZE_MB)).single("markdown_file"),
    validateFileMiddleware(markdownFileSchema),
    authMiddleware(),
    createMarkdown,
  )
  .get("/", validate({ query: getAllMarkdownQuery }), getAllMarkdown);

export default markdownRoutes;