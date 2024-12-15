import { Prisma, Product, UserStatus } from "@prisma/client";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import { paginationHelper } from "../../../helpars/paginationHelper";
import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";
import { IAuthUser } from "../../interfaces/common";
import { IPaginationOptions } from "../../interfaces/pagination";

const create = async (files: any, user: IAuthUser, payload: Product) => {
    const isVendorActive = await prisma.user.findUnique({
        where: {
            id: user?.user,
            status: UserStatus.ACTIVE
        }
    })
    if (!isVendorActive) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Vender is Suspended")
    }
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

const duplicate = async (productId: string) => {
    const originalProduct = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!originalProduct) {
        throw new Error("Product not found");
    }

    const newSlug = `${originalProduct.slug}-2`;

    const { id, ...productData } = originalProduct;

    const result = await prisma.product.create({
        data: {
            ...productData,
            slug: newSlug,
        },
    });

    return result;
};

const getAll = async (
    params: Record<string, unknown>,
    options: IPaginationOptions
) => {
    const { page, limit, skip } = paginationHelper.calculatePagination(options);
    const { searchTerm, minPrice, maxPrice, ...filterData } = params;

    const andConditions: Prisma.ProductWhereInput[] = [];

    // Search term filter
    if (searchTerm) {
        andConditions.push({
            OR: ["name", "brandId", "categoryId", "shopId"].map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }

    // Price range filter
    if (minPrice || maxPrice) {
        const priceCondition: Prisma.ProductWhereInput = {};
        if (minPrice) {
            priceCondition.price = {
                gte: Number(minPrice),
            };
        }
        if (maxPrice) {
            priceCondition.price = {
                lte: Number(maxPrice),
            };
        }
        andConditions.push(priceCondition);
    }

    // Additional filters
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: {
                    equals: (filterData as any)[key],
                },
            })),
        });
    }

    const whereConditions: Prisma.ProductWhereInput = { AND: andConditions };

    // Query the products
    const result = await prisma.product.findMany({
        where: whereConditions,
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
            images: true,
            reviews: true,
        },
    });

    // Calculate average rating for each product
    const productsWithRating = result.map((product: any) => {
        const totalRatings = product.reviews.length;
        const sumRatings = product.reviews.reduce(
            (sum: any, review: { rating: any }) => sum + review.rating,
            0
        );
        const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

        return {
            ...product,
            averageRating,
        };
    });

    // Get total count for pagination
    const total = await prisma.product.count({
        where: whereConditions,
    });

    const totalPage = Math.ceil(total / limit);

    return {
        meta: {
            page,
            limit,
            total,
            totalPage,
        },
        data: productsWithRating,
    };
};

const getOne = async (slug: string) => {
    const result = await prisma.product.findUnique({
        where: {
            slug,
        },
        include: {
            brand: true,
            category: true,
            shop: true,
            images: true,
            reviews: {
                include: {
                    user: true,
                },
            },
        },
    });

    if (result) {
        const totalRatings = result.reviews.length;
        const sumRatings = result.reviews.reduce(
            (sum, review) => sum + review.rating,
            0
        );
        const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

        return {
            ...result,
            rating: averageRating,
        };
    }

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
    duplicate,
    getAll,
    getOne,
    update,
    remove,
};
