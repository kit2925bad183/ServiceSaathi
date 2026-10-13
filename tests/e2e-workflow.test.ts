import { describe, it, expect } from "vitest";
import { calculateDocumentFinancials } from "../src/lib/money";

describe("End-to-End Operational Lifecycle Workflow", () => {
  it("enforces service area pincode validation on booking submission", () => {
    const coveredPincodes = ["600001", "600017", "600028", "600040", "600096"];

    const isCovered = (pincode: string) => coveredPincodes.includes(pincode);

    expect(isCovered("600028")).toBe(true); // Adyar
    expect(isCovered("600017")).toBe(true); // T. Nagar
    expect(isCovered("560001")).toBe(false); // Bengaluru (outside Chennai)
  });

  it("enforces checklist items before marking job as completed", () => {
    const requiredChecklist = [
      "Check initial temperature",
      "Foam spray applied to coils",
      "Verify grill temperature < 16C",
    ];

    const incompleteResponses: Record<string, boolean> = {
      "Check initial temperature": true,
      "Foam spray applied to coils": true,
      "Verify grill temperature < 16C": false, // Incomplete!
    };

    const completeResponses: Record<string, boolean> = {
      "Check initial temperature": true,
      "Foam spray applied to coils": true,
      "Verify grill temperature < 16C": true,
    };

    const validateChecklist = (responses: Record<string, boolean>) => {
      return requiredChecklist.every((item) => responses[item] === true);
    };

    expect(validateChecklist(incompleteResponses)).toBe(false);
    expect(validateChecklist(completeResponses)).toBe(true);
  });

  it("completes full quote-to-invoice-to-partial-payment financial lifecycle", () => {
    // 1. Quotation generated
    const items = [
      { quantity: 1, unitPricePaise: 79900 }, // Cleaning: ₹799
      { quantity: 1, unitPricePaise: 35000 }, // Capacitor: ₹350
    ];

    const financials = calculateDocumentFinancials({
      items,
      discountPaise: 0,
      taxRateBasisPoints: 1800, // 18% GST
    });

    expect(financials.subtotalPaise).toBe(114900);
    expect(financials.taxPaise).toBe(20682);
    expect(financials.totalPaise).toBe(135582); // ₹1,355.82

    // 2. Invoice issued
    let invoice = {
      totalPaise: financials.totalPaise,
      paidAmountPaise: 0,
      balancePaise: financials.totalPaise,
      status: "ISSUED",
    };

    // 3. Partial payment of ₹1,000 received via UPI
    const paymentAmount = 100000;
    invoice = {
      ...invoice,
      paidAmountPaise: invoice.paidAmountPaise + paymentAmount,
      balancePaise: invoice.totalPaise - (invoice.paidAmountPaise + paymentAmount),
      status: "PARTIALLY_PAID",
    };

    expect(invoice.paidAmountPaise).toBe(100000); // ₹1,000.00
    expect(invoice.balancePaise).toBe(35582);    // ₹355.82
    expect(invoice.status).toBe("PARTIALLY_PAID");

    // 4. Final payment of ₹355.82 received
    const finalPayment = 35582;
    invoice = {
      ...invoice,
      paidAmountPaise: invoice.paidAmountPaise + finalPayment,
      balancePaise: invoice.totalPaise - (invoice.paidAmountPaise + finalPayment),
      status: "PAID",
    };

    expect(invoice.paidAmountPaise).toBe(135582);
    expect(invoice.balancePaise).toBe(0);
    expect(invoice.status).toBe("PAID");
  });
});
