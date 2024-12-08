import { Prisma, Product } from "@prisma/client";
import fs from "fs";
import { paginationHelper } from "../../../helpars/paginationHelper";
import prisma from "../../../shared/prisma";
import { IPaginationOptions } from "../../interfaces/pagination";

const create = async (files: any, payload: Product) => {
    const thumbnailFile = files?.thumbnail?.[0]?.path || "";
    const imageFiles = files?.images
        ? files?.images.map((file: { path: any }) => file.path)
        : [];

    if (thumbnailFile) {
        payload.thumbnail = thumbnailFile;
    }

    const result = await prisma.$transaction(async (tx) => {
        const createProduct = await tx.product.create({
            data: payload,
        });
        if (imageFiles.length > 0) {
            await tx.image.createMany({
                data: imageFiles.map((image: string) => ({
                    url: image,
                    productId: createProduct.id,
                })),
            });
        }
    });

    return result;
};

const getAll = async (
    params: Record<string, unknown>,
    options: IPaginationOptions
) => {
    const { page, limit, skip } = paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = params;

    const andCondions: Prisma.ProductWhereInput[] = [];

    //console.log(filterData);
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
    const whereConditons: Prisma.ProductWhereInput = { AND: andCondions };

    const result = await prisma.product.findMany({
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
            brand: true,
            category: true,
            shop: true,
        },
    });

    const total = await prisma.product.count({
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

const getOne = async (id: string): Promise<Product | null> => {
    const result = await prisma.product.findUnique({
        where: {
            id,
        },
    });

    return result;
};

const update = async (id: string, files: any, data: Partial<Product>) => {
    // Check if the product exists
    const existingProduct = await prisma.product.findUniqueOrThrow({
        where: { id },
        include: { images: true }, // Include associated images for comparison
    });

    const thumbnailFile = files?.thumbnail?.[0]?.path || "";
    const newImageFiles = files?.images
        ? files?.images.map((file: { path: string }) => file.path)
        : [];

    // If a new thumbnail is uploaded, update it
    if (thumbnailFile) {
        data.thumbnail = thumbnailFile;
    }

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
        // Update the product
        const updatedProduct = await tx.product.update({
            where: { id },
            data,
        });

        // Handle images
        if (newImageFiles.length > 0) {
            // Delete old images if they are not in the new images list
            const oldImages = existingProduct.images;
            const imagesToDelete = oldImages.filter(
                (image) => !newImageFiles.includes(image.url)
            );

            // Delete old images from the database
            if (imagesToDelete.length > 0) {
                await tx.image.deleteMany({
                    where: {
                        id: {
                            in: imagesToDelete.map((image) => image.id),
                        },
                    },
                });

                // Optionally, remove images from the file system here
                // imagesToDelete.forEach(image => fs.unlinkSync(image.url));
            }

            // Add new images
            await tx.image.createMany({
                data: newImageFiles.map((image: any) => ({
                    url: image,
                    productId: updatedProduct.id,
                })),
            });
        }

        return updatedProduct;
    });

    return result;
};

const remove = async (id: string): Promise<Product | null> => {
    // Fetch the product with its associated images
    const product = await prisma.product.findUniqueOrThrow({
        where: { id },
        include: { images: true }, // Include images for deletion
    });

    // Start a transaction to delete product and associated images
    const result = await prisma.$transaction(async (tx) => {
        // Delete associated images from the database
        if (product.images.length > 0) {
            await tx.image.deleteMany({
                where: { productId: product.id },
            });

            // Optionally, delete files from the file system
            product.images.forEach((image) => {
                try {
                    fs.unlinkSync(image.url); // Replace with actual path logic if needed
                } catch (error) {
                    console.error(`Error deleting file: ${image.url}`, error);
                }
            });
        }

        // Delete the product
        return await tx.product.delete({
            where: { id },
        });
    });

    return result;
};

export const ProductService = {
    create,
    getAll,
    getOne,
    update,
    remove,
};
