/*
  Warnings:

  - You are about to drop the column `scrumMasterId` on the `Developer` table. All the data in the column will be lost.
  - Added the required column `teamId` to the `Developer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DailyEntry" ADD COLUMN "mood" TEXT;
ALTER TABLE "DailyEntry" ADD COLUMN "scrumNote" TEXT;

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scrumMasterId" TEXT NOT NULL,
    CONSTRAINT "Team_scrumMasterId_fkey" FOREIGN KEY ("scrumMasterId") REFERENCES "ScrumMaster" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scrumMasterId" TEXT NOT NULL,
    CONSTRAINT "PasswordResetToken_scrumMasterId_fkey" FOREIGN KEY ("scrumMasterId") REFERENCES "ScrumMaster" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Developer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teamId" TEXT NOT NULL,
    CONSTRAINT "Developer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Developer" ("createdAt", "id", "name", "role") SELECT "createdAt", "id", "name", "role" FROM "Developer";
DROP TABLE "Developer";
ALTER TABLE "new_Developer" RENAME TO "Developer";
CREATE TABLE "new_ScrumMaster" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "questionDoingLabel" TEXT NOT NULL DEFAULT 'O que está fazendo?',
    "questionBlockedLabel" TEXT NOT NULL DEFAULT 'O que está travado?',
    "questionImproveLabel" TEXT NOT NULL DEFAULT 'O que pode melhorar?'
);
INSERT INTO "new_ScrumMaster" ("createdAt", "email", "id", "name", "passwordHash") SELECT "createdAt", "email", "id", "name", "passwordHash" FROM "ScrumMaster";
DROP TABLE "ScrumMaster";
ALTER TABLE "new_ScrumMaster" RENAME TO "ScrumMaster";
CREATE UNIQUE INDEX "ScrumMaster_email_key" ON "ScrumMaster"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
