import { prisma } from "@/lib/db";
import { JobStatus, StockMovementType } from "@prisma/client";

const VALID_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  SCHEDULED: [JobStatus.EN_ROUTE, JobStatus.IN_PROGRESS, JobStatus.CANCELLED],
  EN_ROUTE: [JobStatus.IN_PROGRESS, JobStatus.ON_HOLD, JobStatus.CANCELLED],
  IN_PROGRESS: [JobStatus.COMPLETED, JobStatus.ON_HOLD, JobStatus.CANCELLED],
  ON_HOLD: [JobStatus.IN_PROGRESS, JobStatus.CANCELLED],
  COMPLETED: [], // Terminal state
  CANCELLED: [], // Terminal state
};

export async function transitionJobStatus(params: {
  businessId: string;
  jobId: string;
  actorUserId: string;
  targetStatus: JobStatus;
  completionNotes?: string;
  checklistResponses?: Record<string, boolean>;
  materialsConsumed?: Array<{ inventoryItemId: string; quantity: number }>;
}) {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch job ensuring business scope
    const job = await tx.job.findFirst({
      where: {
        id: params.jobId,
        businessId: params.businessId,
      },
      include: {
        service: true,
      },
    });

    if (!job) {
      throw new Error("Job not found or does not belong to business");
    }

    // 2. Validate state machine transition
    const allowed = VALID_TRANSITIONS[job.status] || [];
    if (!allowed.includes(params.targetStatus)) {
      throw new Error(
        `Invalid status transition: cannot change job from '${job.status}' to '${params.targetStatus}'`
      );
    }

    // 3. If transitioning to COMPLETED, enforce required checklist
    if (params.targetStatus === JobStatus.COMPLETED) {
      const template = await tx.checklistTemplate.findFirst({
        where: {
          businessId: params.businessId,
          serviceId: job.serviceId,
          isRequired: true,
        },
      });

      if (template) {
        const requiredItems: string[] = JSON.parse(template.items || "[]");
        const responses = params.checklistResponses || {};

        const allChecked = requiredItems.length === 0 || requiredItems.every((item) => responses[item] === true);
        if (!allChecked) {
          throw new Error("Cannot complete job: All items in the required checklist must be completed");
        }

        // Record checklist response
        await tx.checklistResponse.create({
          data: {
            businessId: params.businessId,
            jobId: job.id,
            templateId: template.id,
            completedByUserId: params.actorUserId,
            responses: JSON.stringify(responses),
            isPassed: true,
          },
        });
      }
    }

    // 4. Handle materials consumed and update inventory safely
    if (params.materialsConsumed && params.materialsConsumed.length > 0) {
      for (const item of params.materialsConsumed) {
        const inventoryItem = await tx.inventoryItem.findFirst({
          where: {
            id: item.inventoryItemId,
            businessId: params.businessId,
          },
        });

        if (!inventoryItem) {
          throw new Error(`Inventory item ${item.inventoryItemId} not found`);
        }

        if (inventoryItem.stockQuantity < item.quantity) {
          throw new Error(
            `Insufficient stock for '${inventoryItem.name}'. Available: ${inventoryItem.stockQuantity}, Required: ${item.quantity}`
          );
        }

        const newStock = inventoryItem.stockQuantity - item.quantity;

        await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: { stockQuantity: newStock },
        });

        await tx.stockMovement.create({
          data: {
            businessId: params.businessId,
            inventoryItemId: inventoryItem.id,
            jobId: job.id,
            type: StockMovementType.JOB_CONSUMPTION,
            quantityChange: -item.quantity,
            previousQuantity: inventoryItem.stockQuantity,
            newQuantity: newStock,
            reason: `Consumed on Job ${job.jobNumber}`,
            actorUserId: params.actorUserId,
          },
        });
      }
    }

    // 5. Update job status
    const updatedJob = await tx.job.update({
      where: { id: job.id },
      data: {
        status: params.targetStatus,
        completionNotes: params.completionNotes || job.completionNotes,
      },
    });

    // 6. Audit event
    await tx.auditEvent.create({
      data: {
        businessId: params.businessId,
        userId: params.actorUserId,
        action: "JOB_STATUS_CHANGE",
        entityType: "Job",
        entityId: job.id,
        metadata: JSON.stringify({
          fromStatus: job.status,
          toStatus: params.targetStatus,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return updatedJob;
  });
}
