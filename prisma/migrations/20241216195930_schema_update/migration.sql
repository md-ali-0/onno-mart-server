/*
  Warnings:

  - You are about to drop the column `sDeleted` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `sDeleted` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `sDeleted` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `sDeleted` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sDeleted` on the `Review` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Brand" DROP COLUMN "sDeleted",
ADD COLUMN     "isDeleted" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "sDeleted",
ADD COLUMN     "isDeleted" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "sDeleted",
ADD COLUMN     "isDeleted" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "sDeleted",
ADD COLUMN     "isDeleted" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "sDeleted",
ADD COLUMN     "isDeleted" BOOLEAN DEFAULT false;
