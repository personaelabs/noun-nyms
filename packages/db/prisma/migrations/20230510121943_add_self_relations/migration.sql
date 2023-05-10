/*
  Warnings:

  - You are about to drop the column `doxedPostId` on the `DoxedUpvote` table. All the data in the column will be lost.
  - You are about to drop the column `nymPostId` on the `DoxedUpvote` table. All the data in the column will be lost.
  - You are about to drop the `DoxedPost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NymPost` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AttestationScheme" AS ENUM ('EIP712', 'Nym');

-- DropForeignKey
ALTER TABLE "DoxedUpvote" DROP CONSTRAINT "DoxedUpvote_doxedPostId_fkey";

-- DropForeignKey
ALTER TABLE "DoxedUpvote" DROP CONSTRAINT "DoxedUpvote_nymPostId_fkey";

-- AlterTable
ALTER TABLE "DoxedUpvote" DROP COLUMN "doxedPostId",
DROP COLUMN "nymPostId";

-- DropTable
DROP TABLE "DoxedPost";

-- DropTable
DROP TABLE "NymPost";

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "parentId" TEXT,
    "rootId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "groupRoot" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "attestation" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "hashScheme" "HashScheme" NOT NULL,
    "attestationScheme" "AttestationScheme" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_rootId_fkey" FOREIGN KEY ("rootId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoxedUpvote" ADD CONSTRAINT "DoxedUpvote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
