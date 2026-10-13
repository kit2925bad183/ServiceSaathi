import { prisma } from "@/lib/db";
import { InvoiceStatus, LineItemType, PaymentMethod, PaymentStatus } from "@prisma/client";
import { calculateDocumentFinancials } from "@/lib/money";
import { queueOutboxEvent } from "@/lib/queue/outbox";

export async function createInvoice(params: {
  businessId: string;
  customerId: string;
  jobId?: string;
  quotationId?: string;
  dueDays?: number;
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
    const business = await tx.business.findUnique({
      where: { id: params.businessId },
    });

    if (!business) {
      throw new Error("Business not found");
    }

    // 1. Calculate financials on server
    const financials = calculateDocumentFinancials({
      items: params.items,
      discountPaise: params.discountPaise || 0,
      taxRateBasisPoints: business.defaultTaxRateBasisPoints,
    });

    // 2. Generate sequential invoice number
    const invNumber = `${business.invoicePrefix}-${new Date().getFullYear()}-${business.nextInvoiceNumber}`;
    await tx.business.update({
      where: { id: business.id },
      data: { nextInvoiceNumber: business.nextInvoiceNumber + 1 },
    });

    const dueDate = new Date(Date.now() + (params.dueDays || 7) * 24 * 60 * 60 * 1000);

    // 3. Create invoice with immutable snapshots
    const invoice = await tx.invoice.create({
      data: {
        businessId: business.id,
        customerId: params.customerId,
        jobId: params.jobId || null,
        quotationId: params.quotationId || null,
        invoiceNumber: invNumber,
        status: InvoiceStatus.ISSUED,
        issueDate: new Date(),
        dueDate,
        subtotalPaise: financials.subtotalPaise,
        discountPaise: financials.discountPaise,
        taxPaise: financials.taxPaise,
        totalPaise: financials.totalPaise,
        paidAmountPaise: 0,
        balancePaise: financials.totalPaise,
        notes: params.notes || null,
        terms: params.terms || "Payment due within stated terms. GST included.",
      },
    });

    // 4. Create immutable invoice items
    await tx.invoiceItem.createMany({
      data: params.items.map((item) => ({
        invoiceId: invoice.id,
        type: item.type,
        description: item.description,
        quantity: item.quantity,
        unitPricePaise: item.unitPricePaise,
        totalPaise: item.quantity * item.unitPricePaise,
      })),
    });

    // 5. Queue outbox event
    const customer = await tx.customer.findUnique({ where: { id: params.customerId } });
    if (customer?.email) {
      const appUrl = process.env.APP_URL || "http://localhost:3000";
      await queueOutboxEvent(tx, {
        businessId: business.id,
        eventType: "INVOICE_ISSUED",
        aggregateType: "Invoice",
        aggregateId: invoice.id,
        payload: {
          customerName: customer.name,
          customerEmail: customer.email,
          invoiceNumber: invNumber,
          balanceDue: financials.totalPaise,
          invoiceUrl: `${appUrl}/invoices/${invoice.id}`,
        },
      });
    }

    return invoice;
  });
}

/**
 * Record a manual payment (Cash, UPI, Card, NetBanking) against an invoice
 */
export async function recordManualPayment(params: {
  businessId: string;
  invoiceId: string;
  amountPaise: number;
  method: PaymentMethod;
  transactionReference?: string;
  actorUserId?: string;
}) {
  return await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findFirst({
      where: {
        id: params.invoiceId,
        businessId: params.businessId,
      },
    });

    if (!invoice) {
      throw new Error("Invoice not found or unauthorized");
    }

    if (params.amountPaise <= 0) {
      throw new Error("Payment amount must be greater than zero");
    }

    if (params.amountPaise > invoice.balancePaise) {
      throw new Error(
        `Payment amount (₹${(params.amountPaise / 100).toFixed(2)}) exceeds balance due (₹${(invoice.balancePaise / 100).toFixed(2)})`
      );
    }

    const payment = await tx.payment.create({
      data: {
        businessId: params.businessId,
        invoiceId: invoice.id,
        customerId: invoice.customerId,
        amountPaise: params.amountPaise,
        method: params.method,
        transactionReference: params.transactionReference || null,
        status: PaymentStatus.SUCCESS,
        recordedByUserId: params.actorUserId || null,
      },
    });

    const newPaid = invoice.paidAmountPaise + params.amountPaise;
    const newBalance = Math.max(0, invoice.totalPaise - newPaid);
    const newStatus = newBalance === 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;

    await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        paidAmountPaise: newPaid,
        balancePaise: newBalance,
        status: newStatus,
      },
    });

    return { payment, newBalance, status: newStatus };
  });
}
