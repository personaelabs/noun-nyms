/*
  Warnings:

  - Added the required column `address` to the `TreeNode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TreeNode" ADD COLUMN     "address" TEXT NOT NULL;

ALTER TABLE  "TreeNode"
ADD CONSTRAINT "address_missing_hex_prefix" CHECK ("address" ~ '^0x.*');
