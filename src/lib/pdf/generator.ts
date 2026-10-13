import { formatINR, paiseToRupees } from "@/lib/money";

export interface QuotationDocData {
  quotationNumber: string;
  version: number;
  validUntil: Date;
  businessName: string;
  businessPhone: string;
  businessEmail: string;
  businessAddress: string;
  taxRegistrationNumber?: string | null;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: Array<{
    type: string;
    description: string;
    quantity: number;
    unitPricePaise: number;
    totalPaise: number;
  }>;
  subtotalPaise: number;
  discountPaise: number;
  taxPaise: number;
  totalPaise: number;
  notes?: string | null;
  terms?: string | null;
  approvalUrl: string;
}

export function generateQuotationHtml(data: QuotationDocData): string {
  const itemRows = data.items
    .map(
      (item, idx) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${idx + 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">
          <strong>${item.description}</strong>
          <span style="display: block; font-size: 11px; color: #64748b;">${item.type}</span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right;">${formatINR(item.unitPricePaise)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; font-weight: 600;">${formatINR(item.totalPaise)}</td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Quotation ${data.quotationNumber} (v${data.version}) - ${data.businessName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; padding: 32px; background: #ffffff; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0d9488; padding-bottom: 20px; }
    .business-title { font-size: 22px; font-weight: 800; color: #0d9488; margin: 0 0 6px 0; }
    .doc-badge { background: #f0fdfa; color: #0f766e; border: 1px solid #99f6e4; padding: 4px 10px; border-radius: 4px; font-weight: 700; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    th { background: #f8fafc; color: #334155; font-size: 12px; text-transform: uppercase; padding: 10px; text-align: left; border-bottom: 2px solid #cbd5e1; }
    .totals { margin-top: 24px; margin-left: auto; width: 320px; font-size: 14px; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
    .grand-total { font-size: 18px; font-weight: 800; color: #0f766e; border-top: 2px solid #0d9488; padding-top: 10px; }
    .action-box { margin-top: 36px; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="business-title">${data.businessName}</h1>
      <p style="margin: 2px 0; font-size: 13px; color: #475569;">${data.businessAddress}</p>
      <p style="margin: 2px 0; font-size: 13px; color: #475569;">Phone: ${data.businessPhone} | Email: ${data.businessEmail}</p>
      ${data.taxRegistrationNumber ? `<p style="margin: 2px 0; font-size: 12px; color: #64748b;">GSTIN: ${data.taxRegistrationNumber}</p>` : ""}
    </div>
    <div style="text-align: right;">
      <span class="doc-badge">QUOTATION</span>
      <h2 style="margin: 8px 0 4px 0; font-size: 18px;">${data.quotationNumber}</h2>
      <p style="margin: 2px 0; font-size: 12px; color: #64748b;">Version ${data.version}</p>
      <p style="margin: 2px 0; font-size: 12px; color: #64748b;">Valid until: ${data.validUntil.toLocaleDateString("en-IN")}</p>
    </div>
  </div>

  <div style="margin-top: 24px; padding: 16px; background: #f8fafc; border-radius: 6px;">
    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700;">Quote Prepared For</span>
    <h3 style="margin: 4px 0; font-size: 16px; color: #0f172a;">${data.customerName}</h3>
    <p style="margin: 2px 0; font-size: 13px; color: #475569;">Phone: ${data.customerPhone}</p>
    ${data.customerAddress ? `<p style="margin: 2px 0; font-size: 13px; color: #475569;">Address: ${data.customerAddress}</p>` : ""}
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 40px;">#</th>
        <th>Description</th>
        <th style="width: 80px; text-align: center;">Qty</th>
        <th style="width: 120px; text-align: right;">Unit Price</th>
        <th style="width: 130px; text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row">
      <span>Subtotal:</span>
      <span>${formatINR(data.subtotalPaise)}</span>
    </div>
    ${data.discountPaise > 0 ? `
    <div class="total-row" style="color: #b45309;">
      <span>Discount:</span>
      <span>-${formatINR(data.discountPaise)}</span>
    </div>` : ""}
    <div class="total-row">
      <span>GST Tax:</span>
      <span>${formatINR(data.taxPaise)}</span>
    </div>
    <div class="total-row grand-total">
      <span>Total Amount:</span>
      <span>${formatINR(data.totalPaise)}</span>
    </div>
  </div>

  ${data.terms ? `
  <div style="margin-top: 32px; font-size: 12px; color: #64748b;">
    <strong>Terms & Conditions:</strong>
    <p style="margin: 4px 0;">${data.terms}</p>
  </div>` : ""}

  <div class="action-box">
    <p style="margin: 0 0 10px 0; font-size: 13px; color: #334155;">To approve this quotation electronically, visit the link below:</p>
    <a href="${data.approvalUrl}" style="color: #0d9488; font-weight: 700; word-break: break-all; font-size: 13px;">${data.approvalUrl}</a>
  </div>
</body>
</html>
  `;
}
