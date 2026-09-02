/*
  Warnings:

  - Added the required column `markdown_key` to the `blogs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "blogs" ADD COLUMN     "markdown_key" TEXT NOT NULL;
