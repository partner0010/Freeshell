-- CreateTable
CREATE TABLE "AIUsageLimit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dailyLimit" INTEGER NOT NULL DEFAULT 100,
    "monthlyLimit" INTEGER NOT NULL DEFAULT 3000,
    "dailyUsed" INTEGER NOT NULL DEFAULT 0,
    "monthlyUsed" INTEGER NOT NULL DEFAULT 0,
    "lastResetDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "AIUsageLimit_userId_key" ON "AIUsageLimit"("userId");

-- CreateIndex
CREATE INDEX "AIUsageLimit_userId_idx" ON "AIUsageLimit"("userId");

-- CreateIndex
CREATE INDEX "AIUsageLimit_lastResetDate_idx" ON "AIUsageLimit"("lastResetDate");
