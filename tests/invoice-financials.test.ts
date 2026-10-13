import { describe, it, expect } from "vitest";
import {
  paiseToRupees,
  rupeesToPaise,
  formatINR,
  calculateDocumentFinancials,
  calculateLineTotal,
} from "../src/lib/money";

describe("Invoice Financials & Minor-Unit Calculations", () => {
  it("converts paise to rupees and rupees to paise with zero floating-point drift", () => {
    expect(paiseToRupees(149900)).toBe(1499);
    expect(paiseToRupees(35582)).toBe(355.82);
    expect(rupeesToPaise(1499)).toBe(149900);
    expect(rupeesToPaise(355.82)).toBe(35582);
  });

  it("calculates line items without floating-point errors", () => {
    const total = calculateLineTotal(3, 35000); // 3 capacitors @ ₹350
    expect(total).toBe(105000); // ₹1,050.00
  });

  it("calculates accurate subtotal, GST (18%), discount and grand total", () => {
    const items = [
      { quantity: 1, unitPricePaise: 79900 }, // Cleaning: ₹799
      { quantity: 1, unitPricePaise: 35000 }, // Capacitor: ₹350
    ];

    const result = calculateDocumentFinancials({
      items,
      discountPaise: 0,
      taxRateBasisPoints: 1800, // 18%
    });

    expect(result.subtotalPaise).toBe(114900); // ₹1,149.00
    expect(result.discountPaise).toBe(0);
    expect(result.taxablePaise).toBe(114900);
    // 114900 * 0.18 = 20682 paise = ₹206.82
    expect(result.taxPaise).toBe(20682);
    // Total = 114900 + 20682 = 135582 paise = ₹1,355.82
    expect(result.totalPaise).toBe(135582);
  });

  it("applies discounts before tax calculation", () => {
    const items = [{ quantity: 1, unitPricePaise: 100000 }]; // ₹1,000

    const result = calculateDocumentFinancials({
      items,
      discountPaise: 20000, // ₹200 discount
      taxRateBasisPoints: 1800, // 18%
    });

    expect(result.subtotalPaise).toBe(100000);
    expect(result.discountPaise).toBe(20000);
    expect(result.taxablePaise).toBe(80000); // ₹800 taxable
    expect(result.taxPaise).toBe(14400); // 18% of ₹800 = ₹144
    expect(result.totalPaise).toBe(94400); // ₹800 + ₹144 = ₹944
  });

  it("formats Indian Rupee currency correctly", () => {
    const formatted = formatINR(135582);
    expect(formatted).toContain("1,355.82");
  });
});
