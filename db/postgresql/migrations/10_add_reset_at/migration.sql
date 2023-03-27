/*
  Warnings:

  - You are about to drop the column `rev_id` on the `website` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "website" DROP COLUMN "rev_id",
ADD COLUMN     "reset_at" TIMESTAMPTZ(6);
