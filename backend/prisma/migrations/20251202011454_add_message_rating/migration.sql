-- AlterTable
ALTER TABLE "AIMessage" ADD COLUMN "rating" INTEGER;

-- CreateIndex
CREATE INDEX "AIMessage_rating_idx" ON "AIMessage"("rating");
