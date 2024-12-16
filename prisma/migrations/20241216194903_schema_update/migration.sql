-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "sDeleted" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "sDeleted" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "sDeleted" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "sDeleted" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "sDeleted" BOOLEAN DEFAULT false;
