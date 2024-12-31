import { Newsletter, Prisma } from "@prisma/client";
import { paginationHelper } from "../../../helpars/paginationHelper";
import prisma from "../../../shared/prisma";
import { IPaginationOptions } from "../../interfaces/pagination";

const create = async (payload: any) => {
    const result = await prisma.newsletter.create({
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

    const andCondions: Prisma.NewsletterWhereInput[] = [];

    if (params.searchTerm) {
        andCondions.push({
            OR: ["code"].map((field) => ({
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

    const whereConditons: Prisma.NewsletterWhereInput = { AND: andCondions };

    const result = await prisma.newsletter.findMany({
        where: whereConditons,
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? {
                      [options?.sortBy]: options.sortOrder,
                  }
                : {
                      subscribedAt: "desc",
                  },
    });

    const total = await prisma.newsletter.count({
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

const getOne = async (id: string): Promise<Newsletter | null> => {
    const result = await prisma.newsletter.findUnique({
        where: {
            id,
        },
    });

    return result;
};

const update = async (
    id: string,
    data: Partial<Newsletter>
): Promise<Newsletter> => {
    await prisma.coupon.findUniqueOrThrow({
        where: {
            id,
        },
    });

    const result = await prisma.newsletter.update({
        where: {
            id,
        },
        data,
    });

    return result;
};

const remove = async (id: string): Promise<Newsletter | null> => {
    await prisma.newsletter.findUniqueOrThrow({
        where: {
            id,
        },
    });

    const result = await prisma.newsletter.update({
        where: {
            id,
        },
        data: {
            isDeleted: true,
        },
    });

    return result;
};

export const NewsletterService = {
    create,
    getAll,
    getOne,
    update,
    remove,
};
