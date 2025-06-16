import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
    try {
        const { customerId } = params;

        // 驗證 customerId
        if (!customerId || typeof customerId !== "string") {
            return NextResponse.json(
                { message: "customerId 必須提供且為字串" },
                { status: 400 }
            );
        }

        // 查詢訂單
        const orders = await prisma.order.findMany({
            where: {
                customerId,
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                items: {
                    include: {
                        menuItem: {
                            select: {
                                name: true,
                                price: true,
                            },
                        },
                    },
                },
            },
        });

        if (!orders || orders.length === 0) {
            return NextResponse.json([]);
        }

        // 格式化訂單資料
        const formattedOrders = orders.map((order) => ({
            id: order.id,
            status: order.status,
            paymentStatus: order.paymentStatus,
            totalAmount: order.totalAmount,
            createdAt: order.createdAt,
            completedAt: order.completedAt,
            items: order.items.map((item) => ({
                id: item.id,
                menuItem: {
                    name: item.menuItem.name,
                    price: item.menuItem.price,
                },
                quantity: item.quantity,
                specialRequest: item.specialRequest || "",
            })),
        }));

        return NextResponse.json(formattedOrders);
    } catch (error) {
        console.error("取得訂單錯誤:", error);
        return NextResponse.json(
            { message: "伺服器錯誤", error: String(error) },
            { status: 500 }
        );
    }
}

export async function POST(request, { params }) {
    try {
        const body = await request.json();
        const { customerId } = params;
        const { orderItems } = body;

        // 驗證 customerId
        if (!customerId || typeof customerId !== "string") {
            return NextResponse.json(
                { message: "customerId 必須提供且為字串" },
                { status: 400 }
            );
        }

        // 驗證 orderItems
        if (!Array.isArray(orderItems) || orderItems.length === 0) {
            return NextResponse.json(
                { message: "orderItems 必須提供且為非空陣列" },
                { status: 400 }
            );
        }

        // 驗證每個 orderItem 的結構
        for (const item of orderItems) {
            if (
                typeof item.menuItemId !== "string" ||
                typeof item.quantity !== "number"
            ) {
                return NextResponse.json(
                    { message: "每個 orderItem 必須包含 menuItemId（字串）與 quantity（數字）" },
                    { status: 400 }
                );
            }
        }

        // 確認 menuItem 是否存在
        const menuItemIds = orderItems.map((item) => item.menuItemId);
        const menuItems = await prisma.menuItem.findMany({
            where: { id: { in: menuItemIds } },
        });

        if (menuItems.length !== orderItems.length) {
            return NextResponse.json(
                { message: "包含無效的 menuItemId" },
                { status: 400 }
            );
        }

        // 計算總金額
        const priceMap = Object.fromEntries(
            menuItems.map((item) => [item.id, item.price])
        );

        let totalAmount = 0;
        for (const item of orderItems) {
            totalAmount += priceMap[item.menuItemId] * item.quantity;
        }

        // 建立訂單與項目
        const newOrder = await prisma.order.create({
            data: {
                customerId,
                totalAmount,
                items: {
                    create: orderItems.map((item) => ({
                        menuItemId: item.menuItemId,
                        quantity: item.quantity,
                        specialRequest: item.specialRequest || null,
                    })),
                },
            },
            include: {
                items: {
                    include: {
                        menuItem: {
                            select: {
                                name: true,
                                price: true,
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json(newOrder, { status: 200 });
    } catch (error) {
        console.error("建立訂單錯誤:", error);
        return NextResponse.json(
            { message: "伺服器錯誤", error: String(error) },
            { status: 500 }
        );
    }
}
