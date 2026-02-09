import prisma from "@/lib/prisma";
import { checkUser } from "./user-utility";
import { BasicResponse } from "@/types/responses/basic-response";

export const createUser = async (name: string, email: string, password: string): Promise<BasicResponse> => {
    try {
        const existing = await checkUser(email);
        if (existing) {
            return { success: false, message: "User already exists", data: null, code: 409 };
        }
        const user = await prisma.user.create({
            data: { name, email, password },
        });
        return { success: true, data: user };
    } catch (error) {
        return { success: false, message: "Error creating user", data: null, error: error, code: 500 };
    }
};