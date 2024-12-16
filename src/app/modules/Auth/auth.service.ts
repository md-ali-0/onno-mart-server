import { Role, ShopStatus, UserStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";
import emailSender from "./emailSender";

// Utility function for generating tokens
const generateTokens = (user: { id: string; role: Role }) => {
    const accessToken = jwtHelpers.generateToken(
        { user: user.id, role: user.role },
        config.jwt.jwt_secret as Secret,
        config.jwt.expires_in as string
    );

    const refreshToken = jwtHelpers.generateToken(
        { user: user.id, role: user.role },
        config.jwt.refresh_token_secret as Secret,
        config.jwt.refresh_token_expires_in as string
    );

    return { accessToken, refreshToken };
};

// Login Service
const loginUser = async (payload: { email: string; password: string }) => {
    const { email, password } = payload;

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            "User not found or inactive!"
        );
    }
    if (user.status === UserStatus.SUSPEND) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            "User Suspended"
        );
    }
    if (user.isDeleted) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            "User Deleted"
        );
    }
    const isCorrectPassword = await bcrypt.compare(password, user.password);

    if (!isCorrectPassword) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Incorrect password!");
    }

    const tokens = generateTokens(user);

    return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
    };
};

// Signup Service
const signupUser = async (payload: {
    name: string;
    email: string;
    password: string;
    role: Role;
}) => {
    const { name, email, password, role } = payload;

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: "USER",
        },
    });

    return newUser;
};

const vendorSignup = async (files: any, payload: any) => {
    const { name, email, password, shopName, shopDescription } = payload;
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const logoUrl = files?.shopLogo?.[0]?.path || "";

    const result = await prisma.$transaction(async (tx) => {

        const newUser = await tx.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: Role.VENDOR,
            },
        });
        const newVendor = await tx.vendor.create({
            data: {
                userId: newUser.id,
            },
        });
        
        const newShop = await tx.shop.create({
            data: {
                name: shopName,
                description: shopDescription,
                logoUrl,
                vendorId: newVendor.id,
                status: ShopStatus.ACTIVE
            },
        });

        return { newUser, newVendor, newShop };
    });

    return result;
};
// Refresh Token Service
const refreshToken = async (token: string) => {
    let decodedToken;
    try {
        decodedToken = jwtHelpers.verifyToken(
            token,
            config.jwt.refresh_token_secret as Secret
        );
    } catch (err) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid refresh token!");
    }

    const user = await prisma.user.findUnique({
        where: { email: decodedToken.email },
    });

    if (!user) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            "User not found or inactive!"
        );
    }

    const accessToken = jwtHelpers.generateToken(
        { email: user.email, role: user.role },
        config.jwt.jwt_secret as Secret,
        config.jwt.expires_in as string
    );

    return { accessToken };
};

// Change Password Service
const changePassword = async (
    user: { email: string },
    payload: { oldPassword: string; newPassword: string }
) => {
    const { oldPassword, newPassword } = payload;

    const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
    });

    if (!existingUser) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
    }

    const isCorrectPassword = await bcrypt.compare(
        oldPassword,
        existingUser.password
    );

    if (!isCorrectPassword) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Incorrect old password!");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
        where: { email: existingUser.email },
        data: { password: hashedPassword },
    });

    return { message: "Password changed successfully!" };
};

// Forgot Password Service
const forgotPassword = async (payload: { email: string }) => {
    const { email } = payload;

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
    }

    const resetToken = jwtHelpers.generateToken(
        { email: user.email, role: user.role },
        config.jwt.reset_pass_secret as Secret,
        config.jwt.reset_pass_token_expires_in as string
    );

    const resetLink = `${config.reset_pass_link}?token=${resetToken}`;

    await emailSender(
        email,
        `<p>Dear User,</p>
         <p>Click the link below to reset your password:</p>
         <a href="${resetLink}">Reset Password</a>`
    );
};

// Reset Password Service
const resetPassword = async (token: string, payload: { password: string }) => {
    let decodedToken;
    try {
        decodedToken = jwtHelpers.verifyToken(
            token,
            config.jwt.reset_pass_secret as Secret
        );

    } catch (err) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            "Invalid or expired token!"
        );
    }

    const hashedPassword = await bcrypt.hash(payload.password, 12);

    await prisma.user.update({
        where: { email: decodedToken.email },
        data: { password: hashedPassword },
    });

    return { message: "Password reset successful!" };
};

// Export Auth Services
export const AuthServices = {
    loginUser,
    signupUser,
    vendorSignup,
    refreshToken,
    changePassword,
    forgotPassword,
    resetPassword,
};
