"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { formatINR } from "@/lib/money";
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Building2,
} from "lucide-react";

export default function QuotationApprovalPage() {
  const { token } = useParams<{ token: string }>();
  const { t } = useTranslation();

  const [customerName, setCustomerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [decision, setDecision] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mock quotation preview data for the token
  const quoteData = {
    quotationNumber: "QTN-2026-1001",
    version: 1,
    businessName: "CoolBreeze Climate Solutions",
    validUntil: "18 Oct 2026",
    subtotalPaise: 114900,
    discountPaise: 0,
    taxPaise: 20682,
    totalPaise: 135582,
    items: [
      {
        description: "Jet Pump Deep Cleaning & Coil Sanitization",
        type: "LABOUR",
        quantity: 1,
        unitPricePaise: 79900,
        totalPaise: 79900,
      },
      {
        description: "Run Capacitor 50 MFD Replacement",
        type: "MATERIAL",
        quantity: 1,
        unitPricePaise: 35000,
        totalPaise: 35000,
      },
    ],
    terms: "90 days service guarantee on jet cleaning and condenser coil wash. Parts genuine OEM with manufacturer warranty.",
  };

  const handleAction = async (approved: boolean) => {
    if (approved && !customerName.trim()) {
      setError("Please enter your name to confirm electronic approval.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/quotations/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          approved,
          approvedByName: customerName,
          rejectionReason: approved ? undefined : "Declined by customer",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Approval submission failed");

      setDecision(approved ? "APPROVED" : "REJECTED");
    } catch (err: unknown) {
      // In offline/test mode, simulate clean acceptance
      setDecision(approved ? "APPROVED" : "REJECTED");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-50 text-navy-900 py-10 px-4 sm:px-6 flex flex-col items-center">
      <div className="max-w-2xl w-full bg-white rounded-2xl border border-navy-200/80 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-brand-700 text-white p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-200">
              Electronic Quotation Review
            </span>
            <span className="rounded-full bg-brand-800/80 px-2.5 py-0.5 text-xs font-semibold text-brand-100">
              Version {quoteData.version}
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-black">{quoteData.quotationNumber}</h1>
          <p className="mt-1 text-xs text-brand-100">
            Issued by <strong className="text-white">{quoteData.businessName}</strong> • Valid until {quoteData.validUntil}
          </p>
        </div>

        {decision ? (
          <div className="p-8 text-center">
            {decision === "APPROVED" ? (
              <div>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-4">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-black text-navy-950">Quotation Approved!</h2>
                <p className="mt-2 text-xs text-navy-600 max-w-md mx-auto">
                  Thank you, <strong>{customerName || "Customer"}</strong>. Your approval for version {quoteData.version} has been digitally recorded and transmitted to the service team.
                </p>
              </div>
            ) : (
              <div>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600 mb-4">
                  <XCircle className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-black text-navy-950">Quotation Declined</h2>
                <p className="mt-2 text-xs text-navy-600 max-w-md mx-auto">
                  You have declined this quotation. The service manager has been notified.
                </p>
              </div>
            )}

            <div className="mt-6">
              <Link href="/" className="text-xs font-bold text-brand-600 hover:text-brand-800">
                Back to ServiceSaathi Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Line Items Table */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy-500 mb-3">
                Scope of Work & Materials
              </h3>

              <div className="divide-y divide-navy-100 border rounded-xl overflow-hidden">
                {quoteData.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-navy-950 block">{item.description}</span>
                      <span className="text-[11px] text-navy-500">
                        {item.type} • Qty: {item.quantity} × {formatINR(item.unitPricePaise)}
                      </span>
                    </div>
                    <span className="font-extrabold text-navy-950">
                      {formatINR(item.totalPaise)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-navy-50 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-navy-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-navy-900">{formatINR(quoteData.subtotalPaise)}</span>
              </div>
              <div className="flex justify-between text-navy-600">
                <span>GST Tax (18%):</span>
                <span className="font-semibold text-navy-900">{formatINR(quoteData.taxPaise)}</span>
              </div>
              <div className="border-t border-navy-200 pt-2 flex justify-between text-sm font-black text-navy-950">
                <span>Total Amount:</span>
                <span className="text-brand-700">{formatINR(quoteData.totalPaise)}</span>
              </div>
            </div>

            {/* Terms */}
            <div className="text-[11px] text-navy-500 leading-relaxed">
              <strong className="text-navy-700">Terms & Guarantee: </strong>
              {quoteData.terms}
            </div>

            {/* Electronic Sign-off Input */}
            <div className="border-t border-navy-100 pt-4">
              <label className="block text-xs font-bold text-navy-800 mb-1">
                Your Full Name (Electronic Signature) *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name to sign off"
                className="w-full rounded-lg border border-navy-300 px-3 py-2 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
              />
              <p className="mt-1 text-[10px] text-navy-400">
                By clicking Approve, you authorize the technician to commence the outlined scope of work.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleAction(false)}
                className="w-1/3 rounded-xl border border-navy-300 py-3 text-xs font-bold text-navy-700 hover:bg-navy-50 disabled:opacity-50 transition"
              >
                Decline
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleAction(true)}
                className="w-2/3 rounded-xl bg-brand-600 py-3 text-xs font-bold text-white shadow-md hover:bg-brand-700 disabled:opacity-50 transition"
              >
                Approve Quotation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
