import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// 生成檔名的函數
function generateFilename(originalFilename) {
    const timestamp = Date.now();
    return `${timestamp}-${originalFilename}`;
}

const supabase = getSupabase();

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json(
                { error: "沒有上傳檔案" },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 生成檔名
        const filename = generateFilename(file.name);
        const bucketName = process.env.NEXT_SUPABASE_IMAGE_REMOTE_PATTERN;

        if (!bucketName) {
            console.error("缺少 bucket 名稱設定");
            return NextResponse.json(
                { error: "缺少 bucket 名稱設定" },
                { status: 500 }
            );
        }

        console.log("開始上傳到 Supabase:", {
            bucketName,
            filename,
            fileType: file.type,
            fileSize: buffer.length
        });

        // 上傳到 Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filename, buffer, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error("Supabase 上傳失敗:", error);
            return NextResponse.json(
                { error: `圖片上傳失敗: ${error.message}` },
                { status: 500 }
            );
        }

        // 獲取公開 URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filename);

        console.log("上傳成功，URL:", publicUrl);

        return NextResponse.json({ url: publicUrl });
    } catch (error) {
        console.error("圖片上傳失敗:", error);
        return NextResponse.json(
            { error: `圖片上傳失敗: ${error.message}` },
            { status: 500 }
        );
    }
} 