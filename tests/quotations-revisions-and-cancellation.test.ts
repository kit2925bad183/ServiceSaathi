import { describe, it, expect } from "vitest";

describe("Quotation Revisions, Approvals, Rejections, and Job Lifecycle", () => {
  interface QuotationMock {
    id: string;
    version: number;
    status: "DRAFT" | "SENT" | "APPROVED" | "REJECTED" | "SUPERSEDED";
    validUntil: Date;
    approvalToken: string;
    totalPaise: number;
  }

  function reviseQuotation(existingQuote: QuotationMock, newTotalPaise: number): QuotationMock[] {
    const superseded: QuotationMock = {
      ...existingQuote,
      status: "SUPERSEDED",
    };

    const newVersion: QuotationMock = {
      id: `qtn-${Date.now()}`,
      version: existingQuote.version + 1,
      status: "SENT",
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      approvalToken: `appr_rev_${Date.now()}`,
      totalPaise: newTotalPaise,
    };

    return [superseded, newVersion];
  }

  function processApproval(
    quote: QuotationMock,
    action: "APPROVE" | "REJECT",
    currentTime: Date
  ): QuotationMock {
    if (quote.status !== "SENT") {
      throw new Error(`Quotation is already ${quote.status}`);
    }

    if (currentTime > quote.validUntil) {
      throw new Error("Quotation has expired");
    }

    return {
      ...quote,
      status: action === "APPROVE" ? "APPROVED" : "REJECTED",
    };
  }

  it("increments version number and supersedes old version when revised", () => {
    const v1: QuotationMock = {
      id: "qtn-1",
      version: 1,
      status: "SENT",
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      approvalToken: "token-1",
      totalPaise: 80000,
    };

    const [superseded, v2] = reviseQuotation(v1, 95000);

    expect(superseded.status).toBe("SUPERSEDED");
    expect(v2.version).toBe(2);
    expect(v2.status).toBe("SENT");
    expect(v2.totalPaise).toBe(95000);
    expect(v2.approvalToken).not.toBe(v1.approvalToken);
  });

  it("successfully rejects a quotation when customer declines scope", () => {
    const quote: QuotationMock = {
      id: "qtn-2",
      version: 1,
      status: "SENT",
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      approvalToken: "token-2",
      totalPaise: 120000,
    };

    const rejected = processApproval(quote, "REJECT", new Date());
    expect(rejected.status).toBe("REJECTED");
  });

  it("prevents approval of an expired quotation", () => {
    const expiredQuote: QuotationMock = {
      id: "qtn-3",
      version: 1,
      status: "SENT",
      validUntil: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
      approvalToken: "token-3",
      totalPaise: 50000,
    };

    expect(() => {
      processApproval(expiredQuote, "APPROVE", new Date());
    }).toThrowError(/expired/);
  });

  it("validates job cancellation and terminal state rules", () => {
    const validTransitions: Record<string, string[]> = {
      SCHEDULED: ["EN_ROUTE", "IN_PROGRESS", "CANCELLED"],
      EN_ROUTE: ["IN_PROGRESS", "ON_HOLD", "CANCELLED"],
      IN_PROGRESS: ["COMPLETED", "ON_HOLD", "CANCELLED"],
      COMPLETED: [], // Terminal
      CANCELLED: [], // Terminal
    };

    const canTransition = (from: string, to: string) =>
      validTransitions[from]?.includes(to) ?? false;

    // Can cancel scheduled or in-progress jobs
    expect(canTransition("SCHEDULED", "CANCELLED")).toBe(true);
    expect(canTransition("IN_PROGRESS", "CANCELLED")).toBe(true);

    // Cannot transition out of completed or cancelled
    expect(canTransition("COMPLETED", "IN_PROGRESS")).toBe(false);
    expect(canTransition("CANCELLED", "SCHEDULED")).toBe(false);
  });

  it("requires completed job status before allowing customer feedback", () => {
    const canSubmitFeedback = (jobStatus: string) => jobStatus === "COMPLETED";

    expect(canSubmitFeedback("IN_PROGRESS")).toBe(false);
    expect(canSubmitFeedback("SCHEDULED")).toBe(false);
    expect(canSubmitFeedback("COMPLETED")).toBe(true);
  });
});
