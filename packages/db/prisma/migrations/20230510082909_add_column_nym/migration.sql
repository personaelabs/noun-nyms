/*
  Warnings:

  - Added the required column `nym` to the `NymPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NymPost" ADD COLUMN     "nym" TEXT NOT NULL;
