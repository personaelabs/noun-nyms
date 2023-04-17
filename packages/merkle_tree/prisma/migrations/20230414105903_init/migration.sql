-- CreateEnum
CREATE TYPE "GroupType" AS ENUM ('OneNoun', 'ManyNouns');

-- CreateTable
CREATE TABLE "TreeNode" (
    "pubkey" TEXT NOT NULL,
    "type" "GroupType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Tree" (
    "root" TEXT NOT NULL,
    "type" "GroupType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tree_pkey" PRIMARY KEY ("root")
);

-- CreateTable
CREATE TABLE "CachedEOA" (
    "address" TEXT NOT NULL,
    "pubkey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CachedEOA_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "CachedMultiSig" (
    "address" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CachedMultiSig_pkey" PRIMARY KEY ("address")
);

-- CreateIndex
CREATE UNIQUE INDEX "TreeNode_type_pubkey_key" ON "TreeNode"("type", "pubkey");

-- CreateIndex
CREATE UNIQUE INDEX "CachedEOA_pubkey_key" ON "CachedEOA"("pubkey");
