import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
    try {
        const { customerId, orderItems } = await request.json();

        // 驗證必要參數
        if (!customerId || !orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
            return NextResponse.json({ error: "缺少必要參數" }, { status: 400 });
        }

        // 驗證每個 orderItem 的格式
        for (const item of orderItems) {
            if (!item.menuItemId || !item.quantity || item.quantity <= 0) {
                return NextResponse.json({ error: "訂單項目格式錯誤" }, { status: 400 });
            }
        }

        // 查詢所有相關的 MenuItem 以計算總金額
        const menuItemIds = orderItems.map(item => item.menuItemId);
        const menuItems = await prisma.menuItem.findMany({
            where: { id: { in: menuItemIds } },
        });

        // 計算總金額
        let totalAmount = 0;
        for (const item of orderItems) {
            const menuItem = menuItems.find(m => m.id === item.menuItemId);
            if (!menuItem) {
                return NextResponse.json({ error: `找不到餐點: ${item.menuItemId}` }, { status: 400 });
            }
            totalAmount += menuItem.price * item.quantity;
        }

        // 使用 Prisma 交易確保資料一致性
        const order = await prisma.$transaction(async (tx) => {
            // 新增 Order
            const newOrder = await tx.order.create({
                data: {
                    customerId,
                    status: "PENDING",
                    totalAmount,
                },
                include: {
                    customer: {
                        select: {
                            name: true,
                        },
                    },
                },
            });

            // 新增 OrderItems
            const newOrderItems = await Promise.all(
                orderItems.map(item => {
                    const menuItem = menuItems.find(m => m.id === item.menuItemId);
                    return tx.orderItem.create({
                        data: {
                            orderId: newOrder.id,
                            menuItemId: item.menuItemId,
                            quantity: item.quantity,
                            specialRequest: item.specialRequest || "",
                        },
                        include: {
                            menuItem: {
                                select: {
                                    name: true,
                                    price: true,
                                },
                            },
                        },
                    });
                })
            );

            return {
                ...newOrder,
                items: newOrderItems,
            };
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error("新增訂單失敗:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: "未授權" },
                { status: 401 }
            );
        }

        const supabase = getSupabase();
        const { data: orders, error } = await supabase
            .from("Order")
            .select(`
                *,
                items: OrderItem (
                    *,
                    menuItem: MenuItem (*)
                )
            `)
            .eq("customerId", session.user.id)
            .order("createdAt", { ascending: false });

        if (error) {
            return NextResponse.json(
                { error: "獲取訂單失敗" },
                { status: 500 }
            );
        }

        return NextResponse.json(orders);
    } catch (error) {
        console.error("獲取訂單錯誤:", error);
        return NextResponse.json(
            { error: "獲取訂單失敗" },
            { status: 500 }
        );
    }
} 