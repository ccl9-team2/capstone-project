-- Add updatedAt safely for existing comments

ALTER TABLE "Comment"
ADD COLUMN "updatedAt" TIMESTAMP(3);

UPDATE "Comment"
SET "updatedAt" = "createdAt"
WHERE "updatedAt" IS NULL;

ALTER TABLE "Comment"
ALTER COLUMN "updatedAt" SET NOT NULL;