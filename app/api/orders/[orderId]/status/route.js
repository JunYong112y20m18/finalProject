import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    const { orderId } = params;
    if (!orderId) {
      return NextResponse.json({ error: "缺少 orderId" }, { status: 400 });
    }

    const { status } = await request.json();
    if (!status) {
      return NextResponse.json({ error: "缺少 status" }, { status: 400 });
    }

    // 更新訂單狀態
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
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
    console.error("更新訂單狀態失敗:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 