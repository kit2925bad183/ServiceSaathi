import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { contactRequestSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = contactRequestSchema.parse(body);

    const contact = await prisma.contactRequest.create({
      data: {
        name: data.name,
        businessName: data.businessName,
        phone: data.phone,
        email: data.email,
        serviceCategory: data.serviceCategory || null,
        message: data.message,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for reaching out. A ServiceSaathi specialist will contact you shortly.",
      id: contact.id,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to submit request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
