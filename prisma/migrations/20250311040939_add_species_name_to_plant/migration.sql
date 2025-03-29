/*
  Warnings:

  - Added the required column `speciesName` to the `Plant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Plant" ADD COLUMN     "speciesName" TEXT NOT NULL;
