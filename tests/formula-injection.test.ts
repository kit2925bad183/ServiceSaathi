import { describe, it, expect } from "vitest";
import { sanitizeCsvCell, generateSafeCsv } from "../src/lib/security/formula-injection";

describe("Formula Injection Protection", () => {
  it("sanitizes cells starting with formula trigger characters", () => {
    expect(sanitizeCsvCell("=1+1")).toBe("'=1+1");
    expect(sanitizeCsvCell("-5+5")).toBe("'-5+5");
    expect(sanitizeCsvCell("\tMaliciousTab")).toBe("'\tMaliciousTab");
    expect(sanitizeCsvCell("+cmd|' /C calc'!A0")).toBe("'+cmd|' /C calc'!A0");
  });

  it("sanitizes and quotes cells containing commas or newlines", () => {
    expect(sanitizeCsvCell("@SUM(1,2)")).toBe('"\'@SUM(1,2)"');
    expect(sanitizeCsvCell("\rMaliciousCR")).toBe('"\'\rMaliciousCR"');
  });

  it("leaves normal safe alphanumeric strings unaltered", () => {
    expect(sanitizeCsvCell("Rajesh Kumar")).toBe("Rajesh Kumar");
    expect(sanitizeCsvCell("INV-2026-1001")).toBe("INV-2026-1001");
    expect(sanitizeCsvCell(1499.5)).toBe("1499.5");
  });

  it("properly quotes cells containing commas and quotes", () => {
    expect(sanitizeCsvCell('42, Anna Salai "T. Nagar"')).toBe('"42, Anna Salai ""T. Nagar"""');
  });

  it("generates a safe multi-row CSV export", () => {
    const headers = ["ID", "Customer", "Amount"];
    const rows = [
      ["1", "=cmd|' /C calc'!A0", 1000],
      ["2", "Ananya Ramesh", 2000],
    ];

    const csv = generateSafeCsv(headers, rows);
    expect(csv).toContain("ID,Customer,Amount");
    expect(csv).toContain("1,'=cmd|' /C calc'!A0,1000");
    expect(csv).toContain("2,Ananya Ramesh,2000");
  });
});
