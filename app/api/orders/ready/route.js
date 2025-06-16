import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const readyOrders = await prisma.order.findMany({
      where: { status: "READY" },
      include: {
        customer: true,
        items: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(readyOrders);
  } catch (err) {
    console.error("取得 READY 訂單失敗：", err);
    return NextResponse.json({ message: "伺服器錯誤" }, { status: 500 });
  }
}