/*
  Warnings:

  - Added the required column `key` to the `attachments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "attachments" ADD COLUMN     "key" TEXT NOT NULL;
