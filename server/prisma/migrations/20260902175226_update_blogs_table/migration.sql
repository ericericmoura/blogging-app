/*
  Warnings:

  - You are about to drop the column `markdown_filepath` on the `blogs` table. All the data in the column will be lost.
  - You are about to drop the column `markdown_original_filename` on the `blogs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "blogs" DROP COLUMN "markdown_filepath",
DROP COLUMN "markdown_original_filename",
ALTER COLUMN "status" SET DEFAULT 'DRAFT';
