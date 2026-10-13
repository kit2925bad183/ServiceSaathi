import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { registerBusinessSchema } from "@/lib/validation";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { Role } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerBusinessSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const baseSlug = data.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.business.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Business
      const business = await tx.business.create({
        data: {
          name: data.businessName,
          slug,
          phone: data.phone,
          email: data.email.toLowerCase(),
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          categories: JSON.stringify([data.category]),
          serviceAreaPincodes: JSON.stringify([data.postalCode]),
          operatingHours: JSON.stringify({
            monday: { open: "09:00", close: "19:00" },
            tuesday: { open: "09:00", close: "19:00" },
            wednesday: { open: "09:00", close: "19:00" },
            thursday: { open: "09:00", close: "19:00" },
            friday: { open: "09:00", close: "19:00" },
            saturday: { open: "09:00", close: "18:00" },
            sunday: { open: "10:00", close: "14:00" },
          }),
        },
      });

      // 2. Create User
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email.toLowerCase(),
          phone: data.phone,
          passwordHash,
        },
      });

      // 3. Create Owner Membership
      await tx.membership.create({
        data: {
          userId: user.id,
          businessId: business.id,
          role: Role.OWNER,
        },
      });

      // 4. Create Trial Subscription
      await tx.subscription.create({
        data: {
          businessId: business.id,
          plan: "GROWTH",
          status: "TRIAL",
          billingCycle: "MONTHLY",
          currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });

      return { user, business };
    });

    const token = await createSessionToken({
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
      isPlatformAdmin: false,
      activeBusinessId: result.business.id,
      activeRole: Role.OWNER,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      business: result.business,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
