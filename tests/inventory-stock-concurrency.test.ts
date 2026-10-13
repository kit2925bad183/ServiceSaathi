import { describe, it, expect } from "vitest";

describe("Inventory Stock Deductions & Concurrency Protection", () => {
  interface InventoryItem {
    id: string;
    name: string;
    stockQuantity: number;
    minStockThreshold: number;
  }

  function deductStock(
    item: InventoryItem,
    quantityToDeduct: number
  ): { updatedStock: number; isLowStock: boolean } {
    if (quantityToDeduct <= 0) {
      throw new Error("Quantity to deduct must be greater than zero");
    }
    if (item.stockQuantity < quantityToDeduct) {
      throw new Error(
        `Insufficient stock for '${item.name}'. Available: ${item.stockQuantity}, Required: ${quantityToDeduct}`
      );
    }
    const updatedStock = item.stockQuantity - quantityToDeduct;
    return {
      updatedStock,
      isLowStock: updatedStock <= item.minStockThreshold,
    };
  }

  it("successfully deducts stock when sufficient quantity is available", () => {
    const item: InventoryItem = {
      id: "inv-cap-50",
      name: "Run Capacitor 50 MFD",
      stockQuantity: 10,
      minStockThreshold: 3,
    };

    const result = deductStock(item, 2);
    expect(result.updatedStock).toBe(8);
    expect(result.isLowStock).toBe(false);
  });

  it("flags low stock alert when balance reaches or falls below threshold", () => {
    const item: InventoryItem = {
      id: "inv-cap-50",
      name: "Run Capacitor 50 MFD",
      stockQuantity: 4,
      minStockThreshold: 3,
    };

    const result = deductStock(item, 2);
    expect(result.updatedStock).toBe(2);
    expect(result.isLowStock).toBe(true);
  });

  it("strictly throws error and prevents negative stock when requested exceeds available", () => {
    const item: InventoryItem = {
      id: "inv-gas-r32",
      name: "R32 Refrigerant Gas Cylinder (3kg)",
      stockQuantity: 2,
      minStockThreshold: 1,
    };

    expect(() => {
      deductStock(item, 5);
    }).toThrowError(/Insufficient stock for 'R32 Refrigerant Gas Cylinder \(3kg\)'/);
  });

  it("handles exact depletion without going negative", () => {
    const item: InventoryItem = {
      id: "inv-pipe-2m",
      name: "AC Drain Pipe (2m)",
      stockQuantity: 3,
      minStockThreshold: 1,
    };

    const result = deductStock(item, 3);
    expect(result.updatedStock).toBe(0);
    expect(result.isLowStock).toBe(true);
  });
});
