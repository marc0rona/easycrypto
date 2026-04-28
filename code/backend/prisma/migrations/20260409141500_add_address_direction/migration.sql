CREATE TYPE "AddressDirection" AS ENUM ('RECEIVING', 'SENDING');

ALTER TABLE "CryptoAddress"
ADD COLUMN "direction" "AddressDirection" NOT NULL DEFAULT 'RECEIVING';
