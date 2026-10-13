"use client";

import React, { useState } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { formatINR } from "@/lib/money";
import {
  Receipt,
  IndianRupee,
  CheckCircle2,
  Clock,
  PlusCircle,
  CreditCard,
  Building,
  QrCode,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function InvoicesPaymentsPage() {
  const { t } = useTranslation();

  const [invoices, setInvoices] = useState([
    {
      id: "inv-1",
      invoiceNumber: "INV-2026-1001",
      customerName: "Ananya Ramesh",
      phone: "+91 98401 23456",
      totalPaise: 135582,
      paidAmountPaise: 100000,
      balancePaise: 35582,
      status: "PARTIALLY_PAID",
      issueDate: "Today",
      dueDate: "14 Oct 2026",
      items: [
        { desc: "Jet Pump Deep Cleaning & Coil Sanitization", total: 79900 },
        { desc: "Run Capacitor 50 MFD Replacement", total: 35000 },
        { desc: "GST Tax (18%)", total: 20682 },
      ],
      payments: [
        {
          id: "p-1",
          amount: 100000,
          method: "UPI",
          ref: "UPI-AXIS-20260408129",
          date: "Today, 11:30 AM",
        },
      ],
    },
  ]);

  // Payment Recording Modal State
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | null>(null);
  const [payAmountRupees, setPayAmountRupees] = useState<string>("355.82");
  const [payMethod, setPayMethod] = useState<"CASH" | "UPI" | "CARD" | "NETBANKING">("UPI");
  const [payReference, setPayReference] = useState<string>("");
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInvoiceId) return;

    const amountPaise = Math.round(parseFloat(payAmountRupees) * 100);

    // Update in-state
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== activeInvoiceId) return inv;
        const newPaid = inv.paidAmountPaise + amountPaise;
        const newBal = Math.max(0, inv.totalPaise - newPaid);
        return {
          ...inv,
          paidAmountPaise: newPaid,
          balancePaise: newBal,
          status: newBal === 0 ? "PAID" : "PARTIALLY_PAID",
          payments: [
            ...inv.payments,
            {
              id: `p-${Date.now()}`,
              amount: amountPaise,
              method: payMethod,
              ref: payReference || `MANUAL-${payMethod}`,
              date: "Just now",
            },
          ],
        };
      })
    );

    setPaymentNotice(`Payment of ${formatINR(amountPaise)} successfully recorded!`);
    setActiveInvoiceId(null);
    setPayReference("");
    setTimeout(() => setPaymentNotice(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-navy-200/80 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-navy-950">
            {t.common.invoices} & Payment Records
          </h1>
          <p className="text-xs text-navy-500 mt-1">
            GST-compliant tax invoices, immutable line item snapshots, and payment ledger.
          </p>
        </div>
      </div>

      {paymentNotice && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{paymentNotice}</span>
        </div>
      )}

      {/* Invoices List */}
      <div className="space-y-4">
        {invoices.map((inv) => (
          <div
            key={inv.id}
            className="bg-white rounded-2xl border border-navy-200/80 p-5 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-black bg-navy-100 text-navy-900 px-2.5 py-0.5 rounded-md">
                  {inv.invoiceNumber}
                </span>
                <span className="text-sm font-black text-navy-950">
                  {inv.customerName}
                </span>
              </div>

              <span
                className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${
                  inv.status === "PAID"
                    ? "bg-emerald-100 text-emerald-800"
                    : inv.status === "PARTIALLY_PAID"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {inv.status.replace("_", " ")}
              </span>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-navy-50 border border-navy-200/60">
                <span className="text-[10px] uppercase font-bold text-navy-500 block">
                  Total Invoiced
                </span>
                <span className="text-lg font-black text-navy-950 block mt-0.5">
                  {formatINR(inv.totalPaise)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/60">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                  Amount Collected
                </span>
                <span className="text-lg font-black text-emerald-950 block mt-0.5">
                  {formatINR(inv.paidAmountPaise)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/60">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">
                  Balance Remaining Due
                </span>
                <span className="text-lg font-black text-amber-950 block mt-0.5">
                  {formatINR(inv.balancePaise)}
                </span>
              </div>
            </div>

            {/* Payments History Box */}
            <div className="border rounded-xl p-3 bg-navy-50/40 text-xs space-y-2">
              <span className="font-bold text-navy-800 text-[11px] block">
                Recorded Payments Ledger:
              </span>
              {inv.payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-navy-200/60"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded text-[10px]">
                      {p.method}
                    </span>
                    <span className="text-navy-700 font-mono text-[11px]">{p.ref}</span>
                    <span className="text-navy-400 text-[10px]">• {p.date}</span>
                  </div>
                  <span className="font-bold text-emerald-700">
                    +{formatINR(p.amount)}
                  </span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-1">
              {inv.balancePaise > 0 && (
                <button
                  onClick={() => {
                    setActiveInvoiceId(inv.id);
                    setPayAmountRupees((inv.balancePaise / 100).toFixed(2));
                  }}
                  className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700 transition flex items-center gap-1.5"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Record Payment (Cash / UPI)</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Manual Payment Dialog Modal */}
      {activeInvoiceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-navy-200 p-6 max-w-md w-full shadow-xl">
            <h3 className="text-base font-black text-navy-950">Record Manual Payment</h3>
            <p className="text-xs text-navy-500 mt-1">
              Select payment method and enter transaction reference received on field.
            </p>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-700 mb-1">
                  Amount in Rupees (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmountRupees}
                  onChange={(e) => setPayAmountRupees(e.target.value)}
                  className="w-full rounded-lg border border-navy-300 px-3 py-2 text-xs text-navy-900 focus:border-brand-500 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-700 mb-1">
                  Payment Method *
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full rounded-lg border border-navy-300 px-3 py-2 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
                >
                  <option value="UPI">UPI (GPay / PhonePe / Paytm / QR)</option>
                  <option value="CASH">Cash in Hand</option>
                  <option value="CARD">Credit / Debit Card (mPOS)</option>
                  <option value="NETBANKING">NEFT / RTGS Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-700 mb-1">
                  Transaction Reference / UTR Number
                </label>
                <input
                  type="text"
                  value={payReference}
                  onChange={(e) => setPayReference(e.target.value)}
                  placeholder="e.g. UPI-202610119882 or Cash Receipt #12"
                  className="w-full rounded-lg border border-navy-300 px-3 py-2 text-xs text-navy-900 focus:border-brand-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveInvoiceId(null)}
                  className="rounded-xl border border-navy-300 px-4 py-2 text-xs font-semibold text-navy-700 hover:bg-navy-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
