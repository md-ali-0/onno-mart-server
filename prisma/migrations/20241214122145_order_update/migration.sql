/*
  Warnings:

  - A unique constraint covering the columns `[tranId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tranId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "tranId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_tranId_key" ON "Order"("tranId");
