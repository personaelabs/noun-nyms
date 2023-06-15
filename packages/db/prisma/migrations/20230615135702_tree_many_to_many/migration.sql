/*
  Warnings:

  - The primary key for the `Tree` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[type,root,blockHeight]` on the table `Tree` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "DoxedUpvote" DROP CONSTRAINT "DoxedUpvote_groupRoot_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_groupRoot_fkey";

-- DropForeignKey
ALTER TABLE "TreeNode" DROP CONSTRAINT "TreeNode_root_fkey";

-- AlterTable
ALTER TABLE "Tree" DROP CONSTRAINT "Tree_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "Tree_type_root_blockHeight_key" ON "Tree"("type", "root", "blockHeight");
