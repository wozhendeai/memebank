/*
  Warnings:

  - You are about to drop the column `userAddress` on the `BalanceHistory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountId` to the `BalanceHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contractAddress` to the `BalanceHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "BalanceHistory_userAddress_idx";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "username" TEXT;

-- AlterTable
ALTER TABLE "BalanceHistory" DROP COLUMN "userAddress",
ADD COLUMN     "accountId" INTEGER NOT NULL,
ADD COLUMN     "contractAddress" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Account_username_key" ON "Account"("username");

-- CreateIndex
CREATE INDEX "BalanceHistory_accountId_contractAddress_idx" ON "BalanceHistory"("accountId", "contractAddress");

-- AddForeignKey
ALTER TABLE "BalanceHistory" ADD CONSTRAINT "BalanceHistory_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
