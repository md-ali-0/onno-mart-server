import { Prisma, Review } from "@prisma/client";
import { paginationHelper } from "../../../helpars/paginationHelper";
import prisma from "../../../shared/prisma";
import { IPaginationOptions } from "../../interfaces/pagination";

const create = async (payload: any) => {
    const result = await prisma.review.create({
        data: payload,
    });

    return result;
};
const createReply = async (payload: any) => {
    const result = await prisma.reviewReply.create({
        data: payload,
    });
    return result;
};

const getAll = async (
    params: Record<string, unknown>,
    options: IPaginationOptions
) => {
    const { page, limit, skip } = paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = params;

    const andCondions: Prisma.ReviewWhereInput[] = [];
    andCondions.push({
        isDeleted: false,
    });
    //console.log(filterData);
    if (params.searchTerm) {
        andCondions.push({
            OR: ["userId", "productId","shopId"].map((field) => ({
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
    const whereConditons: Prisma.ReviewWhereInput = { AND: andCondions };

    const result = await prisma.review.findMany({
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
            user: true,
            product: true
        }
    });

    const total = await prisma.review.count({
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

const getOne = async (id: string): Promise<Review | null> => {
    const result = await prisma.review.findUnique({
        where: {
            id,
        },
    });

    return result;
};

const update = async (id: string, data: Partial<Review>): Promise<Review> => {
    await prisma.review.findUniqueOrThrow({
        where: {
            id,
        },
    });

    const result = await prisma.review.update({
        where: {
            id,
        },
        data,
    });

    return result;
};

const remove = async (id: string): Promise<Review | null> => {
    await prisma.review.findUniqueOrThrow({
        where: {
            id,
        },
    });

    const result = await prisma.review.update({
        where: {
            id,
        },
        data: {
            isDeleted: true,
        },
    });
    return result;
};

export const ReviewService = {
    create,
    createReply,
    getAll,
    getOne,
    update,
    remove,
};
