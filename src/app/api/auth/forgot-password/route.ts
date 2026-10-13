import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createPasswordResetToken } from "@/lib/auth/password-reset";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        memberships: {
          take: 1,
        },
      },
    });

    if (user) {
      const resetToken = await createPasswordResetToken(user.email);
      const appUrl = process.env.APP_URL || "http://localhost:3000";
      const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

      // In production/dev, if user belongs to a business, queue outbox event
      const businessId = user.memberships[0]?.businessId;
      if (businessId) {
        await prisma.outboxEvent.create({
          data: {
            businessId,
            eventType: "PASSWORD_RESET_REQUESTED",
            aggregateType: "User",
            aggregateId: user.id,
            payload: JSON.stringify({
              userEmail: user.email,
              userName: user.name,
              resetUrl,
            }),
          },
        });
      }

      console.info(`[Auth] Password reset token generated for ${user.email}: ${resetUrl}`);
    }

    // Always return 200 with the same message to prevent email enumeration
    return NextResponse.json({
      success: true,
      message:
        "If an account is associated with this email address, you will receive password reset instructions.",
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
