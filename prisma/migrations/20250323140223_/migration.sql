/*
  Warnings:

  - You are about to drop the column `event` on the `Diary` table. All the data in the column will be lost.
  - Added the required column `healthState` to the `Diary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Diary" DROP COLUMN "event",
ADD COLUMN     "healthState" INTEGER NOT NULL;
