"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { formatINR } from "@/lib/money";
import {
  FileCheck2,
  CheckCircle2,
  Copy,
  ExternalLink,
  PlusCircle,
  Eye,
  Calendar,
  AlertCircle,
  Printer,
} from "lucide-react";

export default function QuotationsPage() {
  const { t } = useTranslation();
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const [quotations, setQuotations] = useState([
    {
      id: "q-1",
      quotationNumber: "QTN-2026-1001",
      version: 1,
      customerName: "Ananya Ramesh",
      phone: "+91 98401 23456",
      jobRef: "JOB-2026-1001",
      totalPaise: 135582,
      subtotalPaise: 114900,
      taxPaise: 20682,
      status: "APPROVED",
      validUntil: "18 Oct 2026",
      approvalToken: "appr_tok_seed_demo_coolbreeze_1001",
    },
    {
      id: "q-2",
      quotationNumber: "QTN-2026-1002",
      version: 1,
      customerName: "Senthil Nathan",
      phone: "+91 98412 88990",
      jobRef: "JOB-2026-1002",
      totalPaise: 176882,
      subtotalPaise: 149900,
      taxPaise: 26982,
      status: "SENT",
      validUntil: "20 Oct 2026",
      approvalToken: "appr_tok_seed_demo_coolbreeze_1002",
    },
  ]);

  const copyApprovalLink = (token: string) => {
    const url = `${window.location.origin}/approve/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-navy-200/80 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-navy-950">
            {t.common.quotations}
          </h1>
          <p className="text-xs text-navy-500 mt-1">
            Itemized labour & materials estimates with secure expiring customer approvals and versioning.
          </p>
        </div>

        <Link
          href="/approve/appr_tok_seed_demo_coolbreeze_1001"
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700 transition"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Customer Approval Link Preview</span>
        </Link>
      </div>

      {copiedToken && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>Customer approval link copied to clipboard! Send to customer via WhatsApp or SMS.</span>
        </div>
      )}

      {/* Quotations List */}
      <div className="space-y-3">
        {quotations.map((q) => (
          <div
            key={q.id}
            className="bg-white rounded-2xl border border-navy-200/80 p-5 shadow-sm hover:shadow-md transition space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black bg-navy-100 text-navy-900 px-2.5 py-0.5 rounded-md">
                  {q.quotationNumber}
                </span>
                <span className="text-xs font-bold bg-navy-50 text-navy-600 px-2 py-0.5 rounded-md">
                  v{q.version}
                </span>
                <span className="text-sm font-bold text-navy-950">
                  {q.customerName}
                </span>
              </div>

              <span
                className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${
                  q.status === "APPROVED"
                    ? "bg-emerald-100 text-emerald-800"
                    : q.status === "REJECTED"
                    ? "bg-rose-100 text-rose-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {q.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-navy-600">
              <div>
                <span className="text-[10px] uppercase font-bold text-navy-400 block">
                  Customer Contact
                </span>
                <span className="font-bold text-navy-900 block">{q.customerName}</span>
                <span className="text-navy-500">{q.phone}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-navy-400 block">
                  Amount Breakdown
                </span>
                <span className="font-black text-navy-950 text-sm block">
                  {formatINR(q.totalPaise)}
                </span>
                <span className="text-[11px] text-navy-400">
                  Subtotal: {formatINR(q.subtotalPaise)} + GST: {formatINR(q.taxPaise)}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-navy-400 block">
                  Validity
                </span>
                <span className="font-bold text-navy-800 block">Valid until {q.validUntil}</span>
                <span className="text-[11px] text-navy-400">Linked to: {q.jobRef}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-navy-50">
              <span className="text-[11px] text-navy-400 font-mono">
                Token: {q.approvalToken.substring(0, 16)}...
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyApprovalLink(q.approvalToken)}
                  className="inline-flex items-center gap-1 rounded-lg border border-navy-300 px-3 py-1.5 text-xs font-bold text-navy-700 hover:bg-navy-50 transition"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Customer Approval Link</span>
                </button>

                <Link
                  href={`/approve/${q.approvalToken}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 rounded-lg bg-brand-50 border border-brand-200 px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-100 transition"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>View Quote</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
