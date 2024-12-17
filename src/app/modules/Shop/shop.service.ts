import { Prisma, Product, Shop } from "@prisma/client";
import fs from "fs";
import { paginationHelper } from "../../../helpars/paginationHelper";
import prisma from "../../../shared/prisma";
import { IPaginationOptions } from "../../interfaces/pagination";

const getAll = async (
    params: Record<string, unknown>,
    options: IPaginationOptions
) => {
    const { page, limit, skip } = paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = params;

    const andCondions: Prisma.ShopWhereInput[] = [];

    if (params.searchTerm) {
        andCondions.push({
            OR: ["name", "brandId", "categoryId", "shopId"].map((field) => ({
                [field]: {
                    contains: params.searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }

    if (Object.keys(filterData).length > 0) {
        andCondions.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: {
                    equals: (filterData as any)[key],
                },
            })),
        });
    }

    //console.dir(andCondions, { depth: 'inifinity' })
    const whereConditons: Prisma.ShopWhereInput = { AND: andCondions };

    const result = await prisma.shop.findMany({
        where: whereConditons,
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? {
                      [options?.sortBy]: options.sortOrder,
                  }
                : {
                      createdAt: "desc",
                  },
        include: {
            vendor: true,
            products: true,
            orders: true,
            followers: true
        },
    });

    const total = await prisma.shop.count({
        where: whereConditons,
    });

    const totalPage = Math.ceil(total / limit);

    return {
        meta: {
            page,
            limit,
            total,
            totalPage,
        },
        data: result,
    };
};

const getOne = async (id: string): Promise<Shop | null> => {
    const result = await prisma.shop.findUnique({
        where: {
            id,
        },
        include: {
            vendor: true,
            products: true,
            orders: true,
            followers: true
        },
    });

    return result;
};

const update = async (id: string, files: any, data: Partial<Shop>) => {
    const existingProduct = await prisma.shop.findUniqueOrThrow({
        where: { id },
    });

    const thumbnailFile = files?.logoUrl?.[0]?.path || "";

    if (thumbnailFile) {
        data.logoUrl = thumbnailFile;
    }

    const result = await prisma.$transaction(async (tx) => {
        const updatedProduct = await tx.shop.update({
            where: { id },
            data,
        });

        return updatedProduct;
    });

    return result;
};

const remove = async (id: string): Promise<Product | null> => {
    const product = await prisma.product.findUniqueOrThrow({
        where: { id },
        include: { images: true },
    });

    const result = await prisma.$transaction(async (tx) => {
        if (product.images.length > 0) {
            await tx.image.deleteMany({
                where: { productId: product.id },
            });

            product.images.forEach((image) => {
                try {
                    fs.unlinkSync(image.url);
                } catch (error) {
                    console.error(`Error deleting file: ${image.url}`, error);
                }
            });
        }
        return await tx.product.delete({
            where: { id },
        });
    });

    return result;
};

export const ShopService = {
    getAll,
    getOne,
    update,
    remove,
};
