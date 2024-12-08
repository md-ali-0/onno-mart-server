import { Role } from "@prisma/client";

export type IAuthUser = {
    user: string;
    role: Role
} | null;