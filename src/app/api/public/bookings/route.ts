import { NextRequest, NextResponse } from "next/server";
import { publicBookingSchema } from "@/lib/validation";
import { createPublicBooking } from "@/modules/bookings/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = publicBookingSchema.parse(body);

    const result = await createPublicBooking({
      businessSlug: validated.businessSlug,
      serviceId: validated.serviceId,
      customerName: validated.customerName,
      customerPhone: validated.customerPhone,
      customerEmail: validated.customerEmail,
      addressLine1: validated.addressLine1,
      addressLine2: validated.addressLine2,
      landmark: validated.landmark,
      postalCode: validated.postalCode,
      requestedDate: validated.requestedDate,
      timeWindow: validated.timeWindow,
      problemDescription: validated.problemDescription,
      submittedAnswers: validated.answers,
    });

    return NextResponse.json({
      success: true,
      bookingReference: result.booking.bookingReference,
      status: result.booking.status,
      businessName: result.business.name,
      message: "Booking request received successfully. A technician will be assigned shortly.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to submit booking";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
