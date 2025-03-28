/*
  Warnings:

  - Added the required column `event` to the `Diary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Diary" ADD COLUMN     "event" INTEGER NOT NULL;
