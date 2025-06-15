import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    const { orderId } = params;
    if (!orderId) {
      return NextResponse.json({ error: "缺少 orderId" }, { status: 400 });
    }

    // 更新訂單狀態為 CANCELLED
    const updatedOrder = await prisma.order.update({
      where: { id: Number(orderId) },
      data: { status: "CANCELLED" },
      include: {
        items: {
          include: {
            menuItem: {
              select: { name: true, price: true },
            },
          },
        },
        customer: { select: { name: true } },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("取消訂單失敗:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 