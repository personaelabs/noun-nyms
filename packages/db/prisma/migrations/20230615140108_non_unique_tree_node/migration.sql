/*
  Warnings:

  - A unique constraint covering the columns `[type,pubkey,root]` on the table `TreeNode` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "TreeNode_type_pubkey_key";

-- CreateIndex
CREATE UNIQUE INDEX "TreeNode_type_pubkey_root_key" ON "TreeNode"("type", "pubkey", "root");
