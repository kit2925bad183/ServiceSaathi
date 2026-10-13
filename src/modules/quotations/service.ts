import crypto from "crypto";
import { prisma } from "@/lib/db";
import { QuotationStatus, ApprovalStatus, LineItemType } from "@prisma/client";
import { calculateDocumentFinancials } from "@/lib/money";
import { queueOutboxEvent } from "@/lib/queue/outbox";

export async function createQuotation(params: {
  businessId: string;
  customerId: string;
  jobId?: string;
  validityDays?: number;
  discountPaise?: number;
  notes?: string;
  terms?: string;
  items: Array<{
    type: LineItemType;
    description: string;
    quantity: number;
    unitPricePaise: number;
  }>;
}) {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch business for tax rate and prefix
    const business = await tx.business.findUnique({
      where: { id: params.businessId },
    });

    if (!business) {
      throw new Error("Business not found");
    }

    // 2. Calculate financials on server
    const financials = calculateDocumentFinancials({
      items: params.items,
      discountPaise: params.discountPaise || 0,
      taxRateBasisPoints: business.defaultTaxRateBasisPoints,
    });

    // 3. Generate sequential quotation number
    const qtnNumber = `${business.quotationPrefix}-${new Date().getFullYear()}-${business.nextQuotationNumber}`;
    await tx.business.update({
      where: { id: business.id },
      data: { nextQuotationNumber: business.nextQuotationNumber + 1 },
    });

    // 4. Secure random token for approval
    const approvalToken = `appr_${crypto.randomBytes(24).toString("hex")}`;
    const validUntil = new Date(Date.now() + (params.validityDays || 7) * 24 * 60 * 60 * 1000);

    // 5. Create quotation
    const quotation = await tx.quotation.create({
      data: {
        businessId: business.id,
        customerId: params.customerId,
        jobId: params.jobId || null,
        quotationNumber: qtnNumber,
        version: 1,
        status: QuotationStatus.SENT,
        subtotalPaise: financials.subtotalPaise,
        discountPaise: financials.discountPaise,
        taxPaise: financials.taxPaise,
        totalPaise: financials.totalPaise,
        notes: params.notes || null,
        terms: params.terms || "Subject to scope inspection. GST applicable as per government norms.",
        validUntil,
        approvalToken,
      },
    });

    // 6. Create quotation items
    await tx.quotationItem.createMany({
      data: params.items.map((item) => ({
        quotationId: quotation.id,
        type: item.type,
        description: item.description,
        quantity: item.quantity,
        unitPricePaise: item.unitPricePaise,
        totalPaise: item.quantity * item.unitPricePaise,
      })),
    });

    // 7. Initialize approval record
    await tx.approval.create({
      data: {
        businessId: business.id,
        quotationId: quotation.id,
        token: approvalToken,
        version: 1,
        status: ApprovalStatus.PENDING,
      },
    });

    // 8. Queue outbox event
    const customer = await tx.customer.findUnique({ where: { id: params.customerId } });
    if (customer?.email) {
      const appUrl = process.env.APP_URL || "http://localhost:3000";
      await queueOutboxEvent(tx, {
        businessId: business.id,
        eventType: "QUOTATION_SENT",
        aggregateType: "Quotation",
        aggregateId: quotation.id,
        payload: {
          customerName: customer.name,
          customerEmail: customer.email,
          quotationNumber: qtnNumber,
          totalAmount: financials.totalPaise,
          approvalUrl: `${appUrl}/approve/${approvalToken}`,
        },
      });
    }

    return quotation;
  });
}

/**
 * Customer approval or rejection of a quotation using token
 */
export async function processCustomerQuotationResponse(params: {
  token: string;
  approved: boolean;
  customerIp?: string;
  userAgent?: string;
  approvedByName?: string;
  rejectionReason?: string;
}) {
  return await prisma.$transaction(async (tx) => {
    const approval = await tx.approval.findUnique({
      where: { token: params.token },
      include: {
        quotation: {
          include: {
            business: true,
          },
        },
      },
    });

    if (!approval) {
      throw new Error("Invalid or expired quotation approval link");
    }

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new Error(`This quotation has already been ${approval.status.toLowerCase()}`);
    }

    if (approval.quotation.validUntil < new Date()) {
      throw new Error("This quotation has expired. Please contact the business for a revised quote.");
    }

    const newApprovalStatus = params.approved ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED;
    const newQuotationStatus = params.approved ? QuotationStatus.APPROVED : QuotationStatus.REJECTED;

    await tx.approval.update({
      where: { id: approval.id },
      data: {
        status: newApprovalStatus,
        customerIp: params.customerIp || null,
        userAgent: params.userAgent || null,
        rejectionReason: params.rejectionReason || null,
        approvedAt: new Date(),
      },
    });

    const updatedQuotation = await tx.quotation.update({
      where: { id: approval.quotationId },
      data: {
        status: newQuotationStatus,
        approvedAt: params.approved ? new Date() : null,
        approvedBy: params.approved ? params.approvedByName || "Customer" : null,
        approvedVersion: params.approved ? approval.version : null,
      },
    });

    return updatedQuotation;
  });
}
