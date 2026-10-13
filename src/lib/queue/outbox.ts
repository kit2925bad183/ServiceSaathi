import { prisma } from "@/lib/db";
import { OutboxStatus, Prisma } from "@prisma/client";

export interface OutboxEventPayload {
  businessId: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
}

/**
 * Creates an outbox event in the same transaction as business data changes
 */
export async function queueOutboxEvent(
  tx: Prisma.TransactionClient,
  event: OutboxEventPayload
) {
  return await tx.outboxEvent.create({
    data: {
      businessId: event.businessId,
      eventType: event.eventType,
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      payload: JSON.stringify(event.payload),
      status: OutboxStatus.PENDING,
      attempts: 0,
    },
  });
}
