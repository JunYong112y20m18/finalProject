import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(request, context) {
    try {
        const params = await context.params;
        const notificationId = params.notificationId;

        // 驗證 notificationId
        if (!notificationId || typeof notificationId !== "string") {
            return NextResponse.json(
                { message: "notificationId 必須提供且為字串" },
                { status: 400 }
            );
        }

        // 刪除通知
        await prisma.notification.delete({
            where: {
                id: notificationId,
            },
        });

        return NextResponse.json({ message: "刪除成功" });
    } catch (error) {
        console.error("刪除通知失敗:", error);
        return NextResponse.json(
            { message: "伺服器錯誤", error: String(error) },
            { status: 500 }
        );
    }
} 