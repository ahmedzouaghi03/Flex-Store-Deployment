import { NextRequest, NextResponse } from "next/server";
import { db } from "@shoestore/db";
import { generateToken } from "@shoestore/utils/token";
import { sendPasswordResetEmail } from "@shoestore/utils/email";
import { forgotPasswordSchema } from "@shoestore/utils/zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const { email } = parsed.data;

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase(), isDeleted: false },
      select: { id: true, email: true },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    const token = generateToken();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.user.update({
      where: { id: user.id },
      data: { passwordResetToken: token, passwordResetExpires: expires },
    });

    await sendPasswordResetEmail(user.email, token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API/AUTH/FORGET-PASSWORD]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
