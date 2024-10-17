/*
  Warnings:

  - You are about to alter the column `ip` on the `session` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE "session" ALTER COLUMN "ip" SET DATA TYPE VARCHAR(100);
