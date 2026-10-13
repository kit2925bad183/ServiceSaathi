import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
      include: {
        memberships: {
          where: { isActive: true },
          include: { business: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(validated.password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const primaryMembership = user.memberships[0];

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      isPlatformAdmin: user.isPlatformAdmin,
      activeBusinessId: primaryMembership?.businessId,
      activeRole: primaryMembership?.role,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: primaryMembership?.role,
        businessSlug: primaryMembership?.business?.slug,
        businessName: primaryMembership?.business?.name,
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Authentication error";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
