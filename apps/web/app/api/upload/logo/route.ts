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

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const publicDir = join(process.cwd(), "public");
    await mkdir(publicDir, { recursive: true });
    // always saved as store-logo.png so both headers can reference a fixed path
    await writeFile(join(publicDir, "store-logo.png"), buffer);

    return NextResponse.json({ url: `/store-logo.png?t=${Date.now()}` });
  } catch (err) {
    console.error("[UPLOAD LOGO]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
