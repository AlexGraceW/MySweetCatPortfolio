/*
  Warnings:

  - You are about to drop the column `photosJson` on the `HomeSection` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HomeSection" DROP COLUMN "photosJson",
ADD COLUMN     "photoUrlsJson" TEXT NOT NULL DEFAULT '[]',
ALTER COLUMN "photoUrl" SET DEFAULT '';
