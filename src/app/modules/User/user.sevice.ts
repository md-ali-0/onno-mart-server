import { Prisma, Role, User } from "@prisma/client";
import bcrypt from "bcrypt";
import { Request } from "express";
import { fileUploader } from "../../../helpars/fileUploader";
import { paginationHelper } from "../../../helpars/paginationHelper";
import prisma from "../../../shared/prisma";
import { IAuthUser } from "../../interfaces/common";
import { IFile } from "../../interfaces/file";
import { IPaginationOptions } from "../../interfaces/pagination";
import { userSearchAbleFields } from "./user.constant";

const getAllFromDB = async (params: any, options: IPaginationOptions) => {
    const { page, limit, skip } = paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = params;

    const andCondions: Prisma.UserWhereInput[] = [];

    //console.log(filterData);
    if (params.searchTerm) {
        andCondions.push({
            OR: userSearchAbleFields.map((field) => ({
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

    const whereConditons: Prisma.UserWhereInput =
        andCondions.length > 0 ? { AND: andCondions } : {};

    const result = await prisma.user.findMany({
        where: whereConditons,
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? {
                      [options.sortBy]: options.sortOrder,
                  }
                : {
                      createdAt: "desc",
                  },
        select: {
            id: true,
            name: true,
            avatar: true,
            status: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    const total = await prisma.user.count({
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

const changeProfileStatus = async (id: string, status: Role) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            id,
        },
    });

    const updateUserStatus = await prisma.user.update({
        where: {
            id,
        },
        data: status,
    });

    return updateUserStatus;
};

const getMyProfile = async (user: IAuthUser) => {
    const userInfo = await prisma.user.findUniqueOrThrow({
        where: {
            id: user?.user,
        },
        select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
            orders: true,
            reviews: true,
            followedShops: true,
            Vendor: true,
            role: true,
        },
    });

    if (userInfo.role === "VENDOR") {
        const vendorData = await prisma.vendor.findUnique({
            where: {
                userId: userInfo.id,
            },
            include: {
                shop: true,
            },
        });
        const userData = {
            ...userInfo,
            shop: vendorData?.shop,
        };
        return userData;
    }

    return userInfo;
};

const updateMyProfie = async (user: IAuthUser, req: Request) => {
    const userInfo = await prisma.user.findUniqueOrThrow({
        where: {
            id: user?.user,
        },
    });

    const file = req.file as IFile;
    if (file) {
        const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
        req.body.profilePhoto = uploadToCloudinary?.secure_url;
    }

    const profileInfo = await prisma.user.update({
        where: {
            email: userInfo.email,
        },
        data: req.body,
    });
    return profileInfo;
};

const update = async (id: string, files: any, data: Partial<User>): Promise<User> => {
    await prisma.user.findUniqueOrThrow({
        where: {
            id
        }
    });

    const avatar = files?.avatar?.[0]?.path || "";
    if (avatar) {
        data.avatar = avatar
    }
    if (data.password) {
        data.password = bcrypt.hashSync(data.password, 10);
    }
    const result = await prisma.user.update({
        where: {
            id
        },
        data
    });

    return result;
};

export const userService = {
    getAllFromDB,
    changeProfileStatus,
    getMyProfile,
    updateMyProfie,
    update
};
