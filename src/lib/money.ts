/**
 * Money utilities for ServiceSaathi
 * All monetary amounts are stored as integer minor units (paise for INR).
 * 1 INR = 100 paise.
 */

export function paiseToRupees(paise: number): number {
  return Number((paise / 100).toFixed(2));
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Format paise into Indian Rupee format (e.g. ₹1,250.00 or ₹1,250)
 */
export function formatINR(paise: number, options?: { showDecimal?: boolean }): string {
  const rupees = paiseToRupees(paise);
  const minDecimals = options?.showDecimal === false ? 0 : 2;
  const maxDecimals = options?.showDecimal === false ? 0 : 2;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  }).format(rupees);
}

/**
 * Calculate line item total in paise
 */
export function calculateLineTotal(quantity: number, unitPricePaise: number): number {
  if (quantity < 0 || unitPricePaise < 0) {
    throw new Error("Quantity and unit price must be non-negative");
  }
  return Math.round(quantity * unitPricePaise);
}

/**
 * Calculate subtotal, discount, tax, and grand total given items, discount and tax rate.
 * Tax rate is in basis points: e.g. 1800 basis points = 18.00%
 */
export function calculateDocumentFinancials(params: {
  items: Array<{ quantity: number; unitPricePaise: number }>;
  discountPaise?: number;
  taxRateBasisPoints?: number; // 1800 = 18%
}): {
  subtotalPaise: number;
  discountPaise: number;
  taxablePaise: number;
  taxPaise: number;
  totalPaise: number;
} {
  const subtotalPaise = params.items.reduce(
    (sum, item) => sum + calculateLineTotal(item.quantity, item.unitPricePaise),
    0
  );

  const discountPaise = Math.min(params.discountPaise || 0, subtotalPaise);
  const taxablePaise = Math.max(0, subtotalPaise - discountPaise);

  const taxRate = (params.taxRateBasisPoints ?? 1800) / 10000;
  const taxPaise = Math.round(taxablePaise * taxRate);
  const totalPaise = taxablePaise + taxPaise;

  return {
    subtotalPaise,
    discountPaise,
    taxablePaise,
    taxPaise,
    totalPaise,
  };
}
