import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "IMGBB_API_KEY is not set in .env.local" },
      { status: 500 },
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert to base64 for imgbb
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const body = new FormData();
    body.append("key", apiKey);
    body.append("image", base64);

    const res = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body,
    });

    const json = (await res.json()) as {
      success: boolean;
      data?: { url: string; display_url: string };
      error?: { message: string };
    };

    if (!json.success || !json.data) {
      return NextResponse.json(
        { error: json.error?.message ?? "imgbb upload failed" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: json.data.url });
  } catch (err) {
    console.error("[upload-image]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
