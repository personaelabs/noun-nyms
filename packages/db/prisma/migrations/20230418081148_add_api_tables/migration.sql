-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "proofOrSig" TEXT NOT NULL,
    "address" TEXT,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoxedUpvote" (
    "postId" TEXT NOT NULL,
    "upvoteBy" TEXT NOT NULL,
    "sig" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DoxedUpvote_upvoteBy_postId_key" ON "DoxedUpvote"("upvoteBy", "postId");

-- AddForeignKey
ALTER TABLE "DoxedUpvote" ADD CONSTRAINT "DoxedUpvote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
