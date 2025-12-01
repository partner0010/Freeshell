-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Schedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "contentType" TEXT NOT NULL,
    "topic" TEXT,
    "topicSource" TEXT,
    "frequency" TEXT NOT NULL,
    "cronExpression" TEXT,
    "nextRunAt" DATETIME NOT NULL,
    "lastRunAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "autoUpload" BOOLEAN NOT NULL DEFAULT true,
    "contentCount" INTEGER NOT NULL DEFAULT 1,
    "platforms" TEXT NOT NULL,
    "settings" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Schedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Schedule" ("autoUpload", "contentType", "createdAt", "cronExpression", "description", "frequency", "id", "isActive", "lastRunAt", "name", "nextRunAt", "platforms", "settings", "topic", "topicSource", "updatedAt", "userId") SELECT "autoUpload", "contentType", "createdAt", "cronExpression", "description", "frequency", "id", "isActive", "lastRunAt", "name", "nextRunAt", "platforms", "settings", "topic", "topicSource", "updatedAt", "userId" FROM "Schedule";
DROP TABLE "Schedule";
ALTER TABLE "new_Schedule" RENAME TO "Schedule";
CREATE INDEX "Schedule_userId_idx" ON "Schedule"("userId");
CREATE INDEX "Schedule_nextRunAt_idx" ON "Schedule"("nextRunAt");
CREATE INDEX "Schedule_isActive_idx" ON "Schedule"("isActive");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
