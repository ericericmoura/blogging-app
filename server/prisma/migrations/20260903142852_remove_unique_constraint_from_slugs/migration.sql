/*
  Warnings:

  - A unique constraint covering the columns `[slug,user_id]` on the table `blogs` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "blogs_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "blogs_slug_user_id_key" ON "blogs"("slug", "user_id");
