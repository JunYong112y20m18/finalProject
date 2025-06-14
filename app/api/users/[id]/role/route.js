import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function PATCH(request, { params }) {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'OWNER') {
            return NextResponse.json(
                { error: '未授權' },
                { status: 401 }
            );
        }

        const { id } = params;
        const { role } = await request.json();

        // 驗證角色是否有效
        if (!['CUSTOMER', 'STAFF', 'CHEF', 'OWNER'].includes(role)) {
            return NextResponse.json(
                { error: '無效的角色' },
                { status: 400 }
            );
        }

        // 不允許修改自己的角色
        if (id === session.user.id) {
            return NextResponse.json(
                { error: '不能修改自己的角色' },
                { status: 400 }
            );
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { role },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('更新用戶角色失敗:', error);
        return NextResponse.json(
            { error: '更新用戶角色失敗' },
            { status: 500 }
        );
    }
} 