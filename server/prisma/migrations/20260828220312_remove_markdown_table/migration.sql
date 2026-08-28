/*
  Warnings:

  - You are about to drop the column `markdown_file_id` on the `blogs` table. All the data in the column will be lost.
  - You are about to drop the `markdown_files` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `markdown_filepath` to the `blogs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `markdown_original_filename` to the `blogs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "blogs" DROP CONSTRAINT "blogs_markdown_file_id_fkey";

-- DropIndex
DROP INDEX "blogs_markdown_file_id_key";

-- AlterTable
ALTER TABLE "blogs" DROP COLUMN "markdown_file_id",
ADD COLUMN     "markdown_filepath" TEXT NOT NULL,
ADD COLUMN     "markdown_original_filename" TEXT NOT NULL,
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "markdown_files";
