import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { customerId } = params;

    // 查詢該顧客的所有訂單
    const orders = await prisma.order.findMany({
      where: {
        customerId,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // 如果找不到訂單，回傳空陣列
    if (!orders || orders.length === 0) {
      return NextResponse.json([]);
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error("查詢訂單失敗:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 