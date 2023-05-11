-- AddForeignKey
ALTER TABLE "DoxedUpvote" ADD CONSTRAINT "DoxedUpvote_groupRoot_fkey" FOREIGN KEY ("groupRoot") REFERENCES "Tree"("root") ON DELETE RESTRICT ON UPDATE CASCADE;
