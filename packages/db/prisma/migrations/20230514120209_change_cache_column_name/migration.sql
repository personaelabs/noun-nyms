/*
  Warnings:

  - You are about to drop the `CachedMultiSig` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "CachedMultiSig";

-- CreateTable
CREATE TABLE "CachedCode" (
    "address" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CachedCode_pkey" PRIMARY KEY ("address")
);
