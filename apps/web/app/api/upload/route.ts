import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filename = `${randomUUID()}.${ext}`;

    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error("[UPLOAD]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
