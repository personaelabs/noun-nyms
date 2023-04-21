/*
  Warnings:

  - Added the required column `timestamp` to the `DoxedUpvote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timestamp` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `venue` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DoxedUpvote" ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "venue" TEXT NOT NULL;
