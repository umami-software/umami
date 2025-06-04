-- ConvertData
UPDATE "report"
SET "parameters" = CONCAT('"', REPLACE(parameters, '"', '\"'), '"');

-- AlterTable
ALTER TABLE "report"
ALTER COLUMN "parameters" SET DATA TYPE JSONB USING parameters::JSONB;
