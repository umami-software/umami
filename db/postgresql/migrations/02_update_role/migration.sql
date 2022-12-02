/*
  Warnings:

  - You are about to drop the column `role_id` on the `team_user` table. All the data in the column will be lost.
  - You are about to drop the column `role_id` on the `user_role` table. All the data in the column will be lost.
  - You are about to drop the `group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `group_role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `group_user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role_permission` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[role,user_id]` on the table `user_role` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `role` to the `team_user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `user_role` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "group_role" DROP CONSTRAINT "group_role_group_id_fkey";

-- DropForeignKey
ALTER TABLE "group_role" DROP CONSTRAINT "group_role_role_id_fkey";

-- DropForeignKey
ALTER TABLE "group_role" DROP CONSTRAINT "group_role_userId_fkey";

-- DropForeignKey
ALTER TABLE "group_user" DROP CONSTRAINT "group_user_group_id_fkey";

-- DropForeignKey
ALTER TABLE "group_user" DROP CONSTRAINT "group_user_user_id_fkey";

-- DropForeignKey
ALTER TABLE "role_permission" DROP CONSTRAINT "role_permission_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "role_permission" DROP CONSTRAINT "role_permission_role_id_fkey";

-- DropForeignKey
ALTER TABLE "team_user" DROP CONSTRAINT "team_user_role_id_fkey";

-- DropForeignKey
ALTER TABLE "user_role" DROP CONSTRAINT "user_role_role_id_fkey";

-- DropIndex
DROP INDEX "user_role_role_id_user_id_key";

-- AlterTable
ALTER TABLE "team_user" DROP COLUMN "role_id",
ADD COLUMN     "role" VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE "user_role" DROP COLUMN "role_id",
ADD COLUMN     "role" VARCHAR(100) NOT NULL;

-- DropTable
DROP TABLE "group";

-- DropTable
DROP TABLE "group_role";

-- DropTable
DROP TABLE "group_user";

-- DropTable
DROP TABLE "permission";

-- DropTable
DROP TABLE "role";

-- DropTable
DROP TABLE "role_permission";

-- CreateIndex
CREATE UNIQUE INDEX "user_role_role_user_id_key" ON "user_role"("role", "user_id");
