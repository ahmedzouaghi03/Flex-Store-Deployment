import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { isAdmin } from "@/lib/auth-guard";
import { validateUpload } from "@/lib/upload-guard";

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
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

    const validation = validateUpload(file, ALLOWED_VIDEO_TYPES, "video");
    if (!validation.ok) {
      return NextResponse.json(
        { error: validation.message },
        { status: validation.status },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const publicDir = join(process.cwd(), "public");
    await mkdir(publicDir, { recursive: true });
    await writeFile(join(publicDir, "store-video.mp4"), buffer);

    return NextResponse.json({ url: `/store-video.mp4?t=${Date.now()}` });
  } catch (err) {
    console.error("[UPLOAD VIDEO]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
