import { prisma } from "@/lib/db";
import { BookingStatus, BookingSource, BookingTimeWindow } from "@prisma/client";
import { queueOutboxEvent } from "@/lib/queue/outbox";

export async function createPublicBooking(params: {
  businessSlug: string;
  serviceId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  postalCode: string;
  requestedDate: string;
  timeWindow: BookingTimeWindow;
  problemDescription: string;
  submittedAnswers?: Record<string, unknown>;
}) {
  // 1. Resolve business by slug
  const business = await prisma.business.findUnique({
    where: { slug: params.businessSlug },
  });

  if (!business) {
    throw new Error(`Business '${params.businessSlug}' not found`);
  }

  // 2. Validate service area pincode coverage
  const coveredPincodes: string[] = JSON.parse(business.serviceAreaPincodes || "[]");
  if (coveredPincodes.length > 0 && !coveredPincodes.includes(params.postalCode)) {
    throw new Error(
      `Pincode ${params.postalCode} is outside the service area for ${business.name}. Covered areas: ${coveredPincodes.join(", ")}`
    );
  }

  // 3. Verify service belongs to this business
  const service = await prisma.businessService.findFirst({
    where: {
      id: params.serviceId,
      businessId: business.id,
      isActive: true,
    },
  });

  if (!service) {
    throw new Error("Selected service is unavailable or invalid");
  }

  return await prisma.$transaction(async (tx) => {
    // 4. Find or create customer
    let customer = await tx.customer.findFirst({
      where: {
        businessId: business.id,
        phone: params.customerPhone,
      },
    });

    if (!customer) {
      customer = await tx.customer.create({
        data: {
          businessId: business.id,
          name: params.customerName,
          phone: params.customerPhone,
          email: params.customerEmail || null,
        },
      });
    }

    // 5. Create customer address
    const address = await tx.customerAddress.create({
      data: {
        businessId: business.id,
        customerId: customer.id,
        line1: params.addressLine1,
        line2: params.addressLine2 || null,
        landmark: params.landmark || null,
        city: business.city,
        state: business.state,
        postalCode: params.postalCode,
        isDefault: true,
      },
    });

    // 6. Generate booking reference
    const count = await tx.booking.count({ where: { businessId: business.id } });
    const reference = `BK-${new Date().getFullYear()}-${1001 + count}`;

    // 7. Create booking record
    const booking = await tx.booking.create({
      data: {
        businessId: business.id,
        customerId: customer.id,
        customerAddressId: address.id,
        serviceId: service.id,
        bookingReference: reference,
        requestedDate: new Date(params.requestedDate),
        timeWindow: params.timeWindow,
        problemDescription: params.problemDescription,
        submittedAnswers: JSON.stringify(params.submittedAnswers || {}),
        source: BookingSource.PUBLIC_PAGE,
        status: BookingStatus.PENDING,
      },
    });

    // 8. Queue transactional outbox event
    await queueOutboxEvent(tx, {
      businessId: business.id,
      eventType: "BOOKING_CREATED",
      aggregateType: "Booking",
      aggregateId: booking.id,
      payload: {
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        bookingReference: reference,
        serviceName: service.name,
        requestedDate: params.requestedDate,
      },
    });

    return { booking, customer, address, service, business };
  });
}
