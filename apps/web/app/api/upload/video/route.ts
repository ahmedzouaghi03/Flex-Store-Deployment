import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { isAdmin } from "@/lib/auth-guard";

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

    const allowed = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: "Only video files are allowed (mp4, webm, ogg)" },
        { status: 400 },
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
