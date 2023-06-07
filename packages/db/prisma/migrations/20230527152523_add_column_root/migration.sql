/*
  Warnings:

  - Added the required column `root` to the `TreeNode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TreeNode" ADD COLUMN     "root" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "TreeNode" ADD CONSTRAINT "TreeNode_root_fkey" FOREIGN KEY ("root") REFERENCES "Tree"("root") ON DELETE RESTRICT ON UPDATE CASCADE;
