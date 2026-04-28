-- AddColumn
ALTER TABLE "User" ADD COLUMN "name" TEXT;

-- Backfill existing users so the new field is immediately usable
UPDATE "User"
SET "name" = "username"
WHERE "name" IS NULL;

-- Make the column required after backfill
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;
