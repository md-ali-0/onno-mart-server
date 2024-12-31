import { Coupon, Prisma } from "@prisma/client";
import { paginationHelper } from "../../../helpars/paginationHelper";
import prisma from "../../../shared/prisma";
import { IPaginationOptions } from "../../interfaces/pagination";

const create = async (payload: any) => {

    const result = await prisma.coupon.create({
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

    const andCondions: Prisma.CouponWhereInput[] = [];

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

    const whereConditons: Prisma.CouponWhereInput = { AND: andCondions };

    const result = await prisma.coupon.findMany({
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
    });

    const total = await prisma.coupon.count({
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

const getOne = async (id: string): Promise<Coupon | null> => {
    const result = await prisma.coupon.findUnique({
        where: {
            id,
        },
    });

    return result;
};

const update = async (id: string, data: Partial<Coupon>): Promise<Coupon> => {
    await prisma.coupon.findUniqueOrThrow({
        where: {
            id,
        },
    });

    const result = await prisma.coupon.update({
        where: {
            id,
        },
        data,
    });

    return result;
};

const remove = async (id: string): Promise<Coupon | null> => {
    await prisma.coupon.findUniqueOrThrow({
        where: {
            id,
        },
    });

    const result = await prisma.coupon.update({
        where: {
            id,
        },
        data: {
            isActive: false,
        },
    });

    return result;
};

export const CouponService = {
    create,
    getAll,
    getOne,
    update,
    remove,
};
