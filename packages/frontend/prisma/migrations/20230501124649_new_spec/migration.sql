/*
  Warnings:

  - You are about to drop the column `upvoteBy` on the `DoxedUpvote` table. All the data in the column will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[address,postId]` on the table `DoxedUpvote` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `address` to the `DoxedUpvote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `groupRoot` to the `DoxedUpvote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `DoxedUpvote` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "HashScheme" AS ENUM ('Keccak256');

-- DropForeignKey
ALTER TABLE "DoxedUpvote" DROP CONSTRAINT "DoxedUpvote_postId_fkey";

-- DropIndex
DROP INDEX "DoxedUpvote_upvoteBy_postId_key";

-- AlterTable
ALTER TABLE "DoxedUpvote" DROP COLUMN "upvoteBy",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "doxedPostId" TEXT,
ADD COLUMN     "groupRoot" TEXT NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "nymPostId" TEXT,
ADD CONSTRAINT "DoxedUpvote_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "Post";

-- CreateTable
CREATE TABLE "NymPost" (
    "id" TEXT NOT NULL,
    "parentId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "groupRoot" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "fullProof" TEXT NOT NULL,
    "hashScheme" "HashScheme" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NymPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoxedPost" (
    "id" TEXT NOT NULL,
    "parentId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "groupRoot" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "sig" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "hashScheme" "HashScheme" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoxedPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DoxedUpvote_address_postId_key" ON "DoxedUpvote"("address", "postId");

-- AddForeignKey
ALTER TABLE "DoxedUpvote" ADD CONSTRAINT "DoxedUpvote_nymPostId_fkey" FOREIGN KEY ("nymPostId") REFERENCES "NymPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoxedUpvote" ADD CONSTRAINT "DoxedUpvote_doxedPostId_fkey" FOREIGN KEY ("doxedPostId") REFERENCES "DoxedPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;
