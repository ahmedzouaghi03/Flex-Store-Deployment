import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { isAdmin } from "@/lib/auth-guard";
import { validateUpload } from "@/lib/upload-guard";

const ALLOWED_HERO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validation = validateUpload(file, ALLOWED_HERO_TYPES, "hero");
    if (!validation.ok) {
      return NextResponse.json(
        { error: validation.message },
        { status: validation.status },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const publicDir = join(process.cwd(), "public");
    await mkdir(publicDir, { recursive: true });
    await writeFile(join(publicDir, "hero-photo.jpg"), buffer);

    return NextResponse.json({ url: `/hero-photo.jpg?t=${Date.now()}` });
  } catch (err) {
    console.error("[UPLOAD HERO]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
