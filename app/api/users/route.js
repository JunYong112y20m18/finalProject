import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

// 獲取所有用戶
export async function GET() {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'OWNER') {
            return NextResponse.json(
                { error: '未授權' },
                { status: 401 }
            );
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('獲取用戶列表失敗:', error);
        return NextResponse.json(
            { error: '獲取用戶列表失敗' },
            { status: 500 }
        );
    }
} 