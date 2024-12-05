import { Brand, Prisma } from "@prisma/client";
import { paginationHelper } from "../../../helpars/paginationHelper";
import prisma from "../../../shared/prisma";
import { IPaginationOptions } from "../../interfaces/pagination";

const create = async (files: any, payload: any) => {

    const image = files?.image?.[0]?.path || "";
    
    const result = await prisma.brand.create({
        data: {
            name: payload.name,
            image
        },
    });

    return result;
};

const getAll = async (params: Record<string, unknown>, options: IPaginationOptions) => {
    const { page, limit, skip } = paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = params;

    const andCondions: Prisma.BrandWhereInput[] = [];

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
    const whereConditons: Prisma.BrandWhereInput = { AND: andCondions }

    const result = await prisma.brand.findMany({
        where: whereConditons,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder ? {
            [options?.sortBy]: options.sortOrder
        } : {
            createdAt: 'desc'
        }
    });

    const total = await prisma.brand.count({
        where: whereConditons
    });

    return {
        meta: {
            page,
            limit,
            total
        },
        data: result
    };
};


const getOne = async (id: string): Promise<Brand | null> => {
    const result = await prisma.brand.findUnique({
        where: {
            id
        }
    })

    return result;
};

const update = async (id: string, files: any, data: Partial<Brand>): Promise<Brand> => {
    await prisma.brand.findUniqueOrThrow({
        where: {
            id
        }
    });

    const image = files?.image?.[0]?.path || "";
    if (image) {
        data.image = image
    }
    const result = await prisma.brand.update({
        where: {
            id
        },
        data
    });

    return result;
};


const remove = async (id: string): Promise<Brand | null> => {

    await prisma.brand.findUniqueOrThrow({
        where: {
            id
        }
    });

    const result = await prisma.brand.delete({
        where: {
            id
        }
    });

    return result;
}

export const BrandService= {
    create,
    getAll,
    getOne,
    update,
    remove
}