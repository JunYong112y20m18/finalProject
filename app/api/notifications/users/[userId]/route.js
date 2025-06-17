import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, context) {
    try {
        const params = await context.params;
        const userId = params.userId;

        // 驗證 userId
        if (!userId || typeof userId !== "string") {
            return NextResponse.json(
                { message: "userId 必須提供且為字串" },
                { status: 400 }
            );
        }

        // 查詢通知
        const notifications = await prisma.notification.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                order: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
            },
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error("取得使用者通知失敗:", error);
        return NextResponse.json(
            { message: "伺服器錯誤", error: String(error) },
            { status: 500 }
        );
    }
}

export async function PATCH(request, context) {
    try {
        const params = await context.params;
        const userId = params.userId;

        // 驗證 userId
        if (!userId || typeof userId !== "string") {
            return NextResponse.json(
                { message: "userId 必須提供且為字串" },
                { status: 400 }
            );
        }

        // 更新所有通知為已讀
        await prisma.notification.updateMany({
            where: {
                userId,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });

        return NextResponse.json({ message: "更新成功" });
    } catch (error) {
        console.error("更新通知狀態失敗:", error);
        return NextResponse.json(
            { message: "伺服器錯誤", error: String(error) },
            { status: 500 }
        );
    }
} 