import { Prisma, Product, UserStatus } from "@prisma/client";
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
            status: UserStatus.ACTIVE,
        },
    });
    if (!isVendorActive) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Vender is Suspended");
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

    andConditions.push({
        isDeleted: false,
    });

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

    const productsWithRating = result.map((product: any) => {
        const totalRatings = product.reviews.length;
        const sumRatings = product.reviews.reduce(
            (sum: any, review: { rating: any }) => sum + review.rating,
            0
        );
        const rating = totalRatings > 0 ? sumRatings / totalRatings : 0;

        return {
            ...product,
            rating,
        };
    });

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
                    replies: {
                        include: {
                            user: true
                        }
                    },
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
    const existingProduct = await prisma.product.findUniqueOrThrow({
        where: { id },
        include: { images: true },
    });

    const thumbnailFile = files?.thumbnail?.[0]?.path || "";
    const newImageFiles = files?.images
        ? files?.images.map((file: { path: string }) => file.path)
        : [];

    if (thumbnailFile) {
        data.thumbnail = thumbnailFile;
    }

    const result = await prisma.$transaction(async (tx) => {
        const updatedProduct = await tx.product.update({
            where: { id },
            data,
        });

        if (newImageFiles.length > 0) {
            const oldImages = existingProduct.images;
            const imagesToDelete = oldImages.filter(
                (image) => !newImageFiles.includes(image.url)
            );

            if (imagesToDelete.length > 0) {
                await tx.image.deleteMany({
                    where: {
                        id: {
                            in: imagesToDelete.map((image) => image.id),
                        },
                    },
                });
            }

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
    await prisma.product.findUniqueOrThrow({
        where: {
            id,
        },
    });

    const result = await prisma.product.update({
        where: {
            id,
        },
        data: {
            isDeleted: true,
        },
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
