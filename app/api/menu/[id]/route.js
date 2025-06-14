import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

// 生成檔名的函數
function generateFilename(originalFilename) {
    const timestamp = Date.now();
    return `${timestamp}-${originalFilename}`;
}

// 獲取單個餐點
export async function GET(request, { params }) {
    try {
        const { id } = params;
        const menuItem = await prisma.menuItem.findUnique({
            where: { id }
        });

        if (!menuItem) {
            return NextResponse.json(
                { error: "找不到餐點" },
                { status: 404 }
            );
        }

        return NextResponse.json(menuItem);
    } catch (error) {
        console.error("獲取餐點失敗:", error);
        return NextResponse.json(
            { error: "獲取餐點失敗" },
            { status: 500 }
        );
    }
}

// 更新餐點
export async function PUT(request, { params }) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "OWNER") {
            return NextResponse.json(
                { error: "未授權" },
                { status: 401 }
            );
        }

        const { id } = params;
        const formData = await request.formData();
        
        // 處理圖片上傳
        const imageFile = formData.get("image");
        let imageUrl = formData.get("imageUrl");

        if (imageFile) {
            try {
                const bytes = await imageFile.arrayBuffer();
                const buffer = Buffer.from(bytes);

                // 生成檔名
                const filename = generateFilename(imageFile.name);
                const bucketName = process.env.NEXT_SUPABASE_IMAGE_REMOTE_PATTERN;

                // 上傳到 Supabase Storage
                const { data, error } = await supabase.storage
                    .from(bucketName)
                    .upload(filename, buffer, {
                        contentType: imageFile.type,
                        cacheControl: '3600',
                        upsert: false
                    });

                if (error) {
                    console.error("Supabase 上傳失敗:", error);
                    throw new Error("圖片上傳失敗：" + error.message);
                }

                // 獲取公開 URL
                const { data: { publicUrl } } = supabase.storage
                    .from(bucketName)
                    .getPublicUrl(filename);

                imageUrl = publicUrl;
            } catch (error) {
                console.error("圖片上傳處理失敗:", error);
                return NextResponse.json(
                    { error: "圖片上傳失敗：" + error.message },
                    { status: 500 }
                );
            }
        }

        // 獲取其他表單數據
        const name = formData.get("name");
        const description = formData.get("description");
        const price = parseFloat(formData.get("price"));
        const isAvailable = formData.get("isAvailable") === "true";

        // 驗證必填欄位
        if (!name || !price) {
            return NextResponse.json(
                { error: "名稱和價格為必填" },
                { status: 400 }
            );
        }

        const menuItem = await prisma.menuItem.update({
            where: { id },
            data: {
                name,
                description,
                price,
                imageUrl,
                isAvailable
            }
        });

        return NextResponse.json(menuItem);
    } catch (error) {
        console.error("更新餐點失敗:", error);
        return NextResponse.json(
            { error: "更新餐點失敗" },
            { status: 500 }
        );
    }
}

// 刪除餐點
export async function DELETE(request, { params }) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "OWNER") {
            return NextResponse.json(
                { error: "未授權" },
                { status: 401 }
            );
        }

        const { id } = params;
        await prisma.menuItem.delete({
            where: { id }
        });

        return NextResponse.json({ message: "餐點已刪除" });
    } catch (error) {
        console.error("刪除餐點失敗:", error);
        return NextResponse.json(
            { error: "刪除餐點失敗" },
            { status: 500 }
        );
    }
} 