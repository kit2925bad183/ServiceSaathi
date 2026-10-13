import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPasswordResetToken } from "@/lib/auth/password-reset";
import bcrypt from "bcryptjs";
import { z } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = resetPasswordSchema.parse(body);

    const verified = await verifyPasswordResetToken(token);
    if (!verified) {
      return NextResponse.json(
        { error: "Invalid or expired password reset link. Please request a new one." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: verified.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Account no longer exists." },
        { status: 404 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({
      success: true,
      message: "Your password has been reset successfully. You can now sign in with your new credentials.",
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Password reset failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
