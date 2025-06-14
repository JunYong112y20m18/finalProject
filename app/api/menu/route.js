import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// 獲取所有餐點
export async function GET() {
    try {
        const menuItems = await prisma.menuItem.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json(menuItems);
    } catch (error) {
        console.error("獲取餐點失敗:", error);
        return NextResponse.json(
            { error: "獲取餐點失敗" },
            { status: 500 }
        );
    }
}

// 新增餐點
export async function POST(request) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "OWNER") {
            return NextResponse.json(
                { error: "未授權" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, description, price, imageUrl, isAvailable } = body;

        // 驗證必填欄位
        if (!name || !price) {
            return NextResponse.json(
                { error: "名稱和價格為必填" },
                { status: 400 }
            );
        }

        const menuItem = await prisma.menuItem.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                imageUrl,
                isAvailable: isAvailable ?? true
            }
        });

        return NextResponse.json(menuItem);
    } catch (error) {
        console.error("新增餐點失敗:", error);
        return NextResponse.json(
            { error: "新增餐點失敗" },
            { status: 500 }
        );
    }
} 