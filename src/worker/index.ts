import { prisma } from "../lib/db";
import { OutboxStatus } from "@prisma/client";
import { sendEmail } from "../lib/adapters/email";
import { sendTransactionalMessage } from "../lib/adapters/messaging";

const MAX_ATTEMPTS = 5;
const POLL_INTERVAL_MS = 3000;

async function processOutboxEvent(event: {
  id: string;
  businessId: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload: string;
  attempts: number;
}) {
  const payload = JSON.parse(event.payload);

  switch (event.eventType) {
    case "BOOKING_CREATED": {
      const { customerEmail, customerPhone, customerName, bookingReference, serviceName } = payload;
      if (customerEmail) {
        await sendEmail({
          to: customerEmail,
          subject: `Booking Confirmed: ${serviceName} (${bookingReference})`,
          html: `<h2>Hello ${customerName},</h2><p>Your service request <strong>${bookingReference}</strong> for <strong>${serviceName}</strong> has been received by the team. A technician will be assigned shortly.</p>`,
        });
      }
      if (customerPhone) {
        await sendTransactionalMessage({
          recipientPhone: customerPhone,
          templateName: "booking_confirmation",
          parameters: { reference: bookingReference, service: serviceName },
          fallbackText: `ServiceSaathi: Your booking ${bookingReference} for ${serviceName} is received. Thank you!`,
        });
      }
      break;
    }

    case "JOB_ASSIGNED": {
      const { technicianEmail, technicianPhone, technicianName, jobNumber, customerAddress, scheduledTime } = payload;
      if (technicianEmail) {
        await sendEmail({
          to: technicianEmail,
          subject: `New Job Assigned: ${jobNumber}`,
          html: `<h3>Hello ${technicianName},</h3><p>You have been assigned to job <strong>${jobNumber}</strong> scheduled for ${scheduledTime}. Location: ${customerAddress}.</p>`,
        });
      }
      if (technicianPhone) {
        await sendTransactionalMessage({
          recipientPhone: technicianPhone,
          templateName: "job_assigned",
          parameters: { job: jobNumber, time: scheduledTime },
          fallbackText: `New Job Assigned: ${jobNumber} scheduled at ${scheduledTime}. Location: ${customerAddress}`,
        });
      }
      break;
    }

    case "QUOTATION_SENT": {
      const { customerEmail, customerName, quotationNumber, totalAmount, approvalUrl } = payload;
      if (customerEmail) {
        await sendEmail({
          to: customerEmail,
          subject: `Quotation Ready for Review: ${quotationNumber}`,
          html: `<h3>Dear ${customerName},</h3><p>Your quotation <strong>${quotationNumber}</strong> for amount <strong>${totalAmount}</strong> is ready for your review and approval.</p><p><a href="${approvalUrl}" style="background-color:#0d9488;color:white;padding:10px 18px;text-decoration:none;border-radius:6px;display:inline-block;">Review & Approve Quotation</a></p>`,
        });
      }
      break;
    }

    case "INVOICE_ISSUED": {
      const { customerEmail, customerName, invoiceNumber, balanceDue, invoiceUrl } = payload;
      if (customerEmail) {
        await sendEmail({
          to: customerEmail,
          subject: `Invoice Generated: ${invoiceNumber}`,
          html: `<h3>Dear ${customerName},</h3><p>Your tax invoice <strong>${invoiceNumber}</strong> has been generated. Amount due: <strong>${balanceDue}</strong>.</p><p><a href="${invoiceUrl}" style="background-color:#0d9488;color:white;padding:10px 18px;text-decoration:none;border-radius:6px;display:inline-block;">View & Pay Invoice</a></p>`,
        });
      }
      break;
    }

    default:
      console.info(`[Worker] Handled generic event: ${event.eventType}`);
  }
}

export async function processOutboxBatch(): Promise<number> {
  const pendingEvents = await prisma.outboxEvent.findMany({
    where: {
      status: OutboxStatus.PENDING,
      attempts: { lt: MAX_ATTEMPTS },
    },
    take: 20,
    orderBy: { createdAt: "asc" },
  });

  for (const event of pendingEvents) {
    try {
      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: { status: OutboxStatus.PROCESSING, lastAttemptAt: new Date() },
      });

      await processOutboxEvent(event);

      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          status: OutboxStatus.COMPLETED,
          attempts: event.attempts + 1,
        },
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const isLastAttempt = event.attempts + 1 >= MAX_ATTEMPTS;

      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          status: isLastAttempt ? OutboxStatus.FAILED : OutboxStatus.PENDING,
          attempts: event.attempts + 1,
          errorMessage: errorMsg,
        },
      });
      console.error(`[Worker] Error processing event ${event.id}:`, errorMsg);
    }
  }

  return pendingEvents.length;
}

async function startWorker() {
  console.info("⚡ ServiceSaathi Background Outbox Worker started.");

  const loop = async () => {
    try {
      await processOutboxBatch();
    } catch (err) {
      console.error("[Worker Loop Error]", err);
    }
    setTimeout(loop, POLL_INTERVAL_MS);
  };

  loop();
}

if (require.main === module) {
  startWorker().catch((err) => {
    console.error("Worker fatal start error:", err);
    process.exit(1);
  });
}
