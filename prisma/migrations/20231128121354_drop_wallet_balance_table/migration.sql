/*
  Warnings:

  - You are about to drop the `wallet_balances` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `balance` to the `wallets` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "wallet_balances" DROP CONSTRAINT "wallet_balances_customerId_fkey";

-- DropForeignKey
ALTER TABLE "wallet_balances" DROP CONSTRAINT "wallet_balances_walletId_fkey";

-- AlterTable
ALTER TABLE "wallets" ADD COLUMN     "balance" TEXT NOT NULL;

-- DropTable
DROP TABLE "wallet_balances";
