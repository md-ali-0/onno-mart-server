import { Prisma, Role, User } from "@prisma/client";
import bcrypt from "bcrypt";
import { paginationHelper } from "../../../helpars/paginationHelper";
import prisma from "../../../shared/prisma";
import { IAuthUser } from "../../interfaces/common";
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

const getAllFavoriteShops = async (
    userId: string,
    params: any,
    options: IPaginationOptions
  ) => {
    const { page, limit, skip } = paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = params;
  
    const andConditions: Prisma.ShopWhereInput[] = [];
  
    // Add search condition for shop name
    if (searchTerm) {
      andConditions.push({
        name: {
          contains: searchTerm,
          mode: "insensitive",
        },
      });
    }
  
    // Add filter conditions based on provided filterData
    if (Object.keys(filterData).length > 0) {
      andConditions.push({
        AND: Object.keys(filterData).map((key) => ({
          [key]: {
            equals: filterData[key],
          },
        })),
      });
    }
  
    const whereConditions: Prisma.ShopWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};
  
    // Find favorite shops based on userId
    const result = await prisma.shop.findMany({
      where: {
        followers: {
          some: {
            id: userId,
          },
        },
        ...whereConditions,
      },
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
        logoUrl: true,
        description: true,
        vendorId: true,
        products: true,
        followers: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  
    // Count total favorite shops
    const total = await prisma.shop.count({
      where: {
        followers: {
          some: {
            id: userId,
          },
        },
        ...whereConditions,
      },
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
            phone: true,
            city: true,
            state: true,
            zip_code: true,
            address: true,
            country: true,
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

const updateMyProfie = async (
    user: IAuthUser,
    files: any,
    data: Partial<User>
) => {
    const userInfo = await prisma.user.findUniqueOrThrow({
        where: {
            id: user?.user,
        },
    });

    const avatar = files?.avatar?.[0]?.path || "";
    if (avatar) {
        data.avatar = avatar;
    }
    if (data.password) {
        data.password = bcrypt.hashSync(data.password, 10);
    }
    const profileInfo = await prisma.user.update({
        where: {
            email: userInfo.email,
        },
        data: data,
    });
    return profileInfo;
};

const update = async (
    id: string,
    files: any,
    data: Partial<User>
): Promise<User> => {
    await prisma.user.findUniqueOrThrow({
        where: {
            id,
        },
    });

    const avatar = files?.avatar?.[0]?.path || "";
    if (avatar) {
        data.avatar = avatar;
    }
    if (data.password) {
        data.password = bcrypt.hashSync(data.password, 10);
    }
    const result = await prisma.user.update({
        where: {
            id,
        },
        data,
    });

    return result;
};

const followShop = async (data: { userId: string; shopId: string }) => {
    console.log(data);
    
    const isFollowing = await prisma.shop.findFirst({
        where: {
          id: data.shopId,
          followers: {
            some: {
              id: data.userId,
            },
          },
        },
      });
    
    if (isFollowing) {
        return { message: "Already following this shop." };
    }

    const result = await prisma.user.update({
        where: { id: data.userId },
        data: {
            followedShops: {
                connect: { id: data.shopId },
            },
        },
    });
    console.log(result);
    
    return result;
};

const unfollowShop = async (data: { userId: string; shopId: string }) => {
    const isFollowing = await prisma.shop.findFirst({
        where: {
            id: data.shopId,
            followers: {
                some: { id: data.userId },
            },
        },
    });

    if (!isFollowing) {
        return { message: "Already following this shop." };
    }

    await prisma.user.update({
        where: { id: data.userId },
        data: {
            followedShops: {
                disconnect: { id: data.shopId },
            },
        },
    });

    return true;
};

export const userService = {
    getAllFromDB,
    getAllFavoriteShops,
    changeProfileStatus,
    getMyProfile,
    updateMyProfie,
    update,
    followShop,
    unfollowShop
};
