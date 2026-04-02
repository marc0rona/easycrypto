-- CreateEnum
CREATE TYPE "CryptoType" AS ENUM ('BTC', 'ETH', 'SOL', 'LTC', 'DOGE');

-- AlterTable
ALTER TABLE "CryptoAddress"
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "type" TYPE "CryptoType" USING (UPPER("type")::"CryptoType");

-- CreateIndex
CREATE INDEX "CryptoAddress_address_idx" ON "CryptoAddress"("address");

-- CreateIndex
CREATE UNIQUE INDEX "CryptoAddress_userId_address_type_key" ON "CryptoAddress"("userId", "address", "type");
