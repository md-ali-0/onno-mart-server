import { Category, Prisma } from "@prisma/client";
import { paginationHelper } from "../../../helpars/paginationHelper";
import prisma from "../../../shared/prisma";
import { IPaginationOptions } from "../../interfaces/pagination";

const create = async (payload: any) => {

    const result = await prisma.category.create({
        data: payload,
    });

    return result;
};

const getAll = async (params: Record<string, unknown>, options: IPaginationOptions) => {
    const { page, limit, skip } = paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = params;

    const andCondions: Prisma.CategoryWhereInput[] = [];

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
    const whereConditons: Prisma.CategoryWhereInput = { AND: andCondions }

    const result = await prisma.category.findMany({
        where: whereConditons,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder ? {
            [options?.sortBy]: options.sortOrder
        } : {
            createdAt: 'desc'
        }
    });

    const total = await prisma.category.count({
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


const getOne = async (id: string): Promise<Category | null> => {
    const result = await prisma.category.findUnique({
        where: {
            id
        }
    })

    return result;
};

const update = async (id: string, data: Partial<Category>): Promise<Category> => {
    await prisma.category.findUniqueOrThrow({
        where: {
            id
        }
    });

    const result = await prisma.category.update({
        where: {
            id
        },
        data
    });

    return result;
};


const remove = async (id: string): Promise<Category | null> => {

    await prisma.category.findUniqueOrThrow({
        where: {
            id
        }
    });

    const result = await prisma.category.delete({
        where: {
            id
        }
    });

    return result;
}

export const CategoryService= {
    create,
    getAll,
    getOne,
    update,
    remove
}