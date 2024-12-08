-- AlterTable
ALTER TABLE "_FollowedShops" ADD CONSTRAINT "_FollowedShops_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_FollowedShops_AB_unique";
