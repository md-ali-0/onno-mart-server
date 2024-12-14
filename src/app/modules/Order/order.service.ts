import { Order, Prisma } from "@prisma/client";
import { paginationHelper } from "../../../helpars/paginationHelper";
import prisma from "../../../shared/prisma";
import { IPaginationOptions } from "../../interfaces/pagination";

const getAll = async (params: Record<string, unknown>, options: IPaginationOptions) => {
    const { page, limit, skip } = paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = params;

    const andCondions: Prisma.OrderWhereInput[] = [];

    //console.log(filterData);
    if (params.searchTerm) {
        andCondions.push({
            OR: ['name'].map(field => ({
                [field]: {
                    contains: params.searchTerm,
                    mode: 'insensitive'
                }
            }))
        })
    };

    if (Object.keys(filterData).length > 0) {
        andCondions.push({
            AND: Object.keys(filterData).map(key => ({
                [key]: {
                    equals: (filterData as any)[key]
                }
            }))
        })
    };

    //console.dir(andCondions, { depth: 'inifinity' })
    const whereConditons: Prisma.OrderWhereInput = { AND: andCondions }

    const result = await prisma.order.findMany({
        where: whereConditons,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder ? {
            [options?.sortBy]: options.sortOrder
        } : {
            createdAt: 'desc'
        },
        include: {
            user: true,
            products: true,
            shop: true
        }
    });

    const total = await prisma.order.count({
        where: whereConditons
    });

    const totalPage = Math.ceil(total / limit)

    return {
        meta: {
            page,
            limit,
            total,
            totalPage
        },
        data: result
    };
};


const getOne = async (id: string): Promise<Order | null> => {
    const result = await prisma.order.findUnique({
        where: {
            id
        }
    })

    return result;
};

const update = async (id: string, data: Partial<Order>): Promise<Order> => {
    await prisma.order.findUniqueOrThrow({
        where: {
            id
        }
    });

    const result = await prisma.order.update({
        where: {
            id
        },
        data
    });

    return result;
};


const remove = async (id: string): Promise<Order | null> => {

    await prisma.order.findUniqueOrThrow({
        where: {
            id
        }
    });

    const result = await prisma.order.delete({
        where: {
            id
        }
    });

    return result;
}

export const OrderService= {
    getAll,
    getOne,
    update,
    remove
}