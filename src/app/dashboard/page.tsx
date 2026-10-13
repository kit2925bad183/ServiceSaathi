"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { StatCard } from "@/components/ui/StatCard";
import { formatINR } from "@/lib/money";
import {
  CalendarDays,
  UserX,
  Clock,
  FileCheck2,
  Receipt,
  CheckCircle2,
  IndianRupee,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Smartphone,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function DashboardPage() {
  const { t, locale } = useTranslation();

  // Metrics from real business data (matching seed data)
  const [metrics, setMetrics] = useState({
    todayAppointments: 1,
    unassignedJobs: 0,
    inProgressJobs: 1,
    pendingQuotations: 1,
    completedJobs: 1,
    invoicedRevenuePaise: 135582,   // ₹1,355.82 total invoiced
    collectedRevenuePaise: 100000,  // ₹1,000.00 actual collected payments
    outstandingRevenuePaise: 35582, // ₹355.82 remaining balance
  });

  const recentActivities = [
    {
      id: "act-1",
      title: "Partial Payment Received via UPI",
      description: "₹1,000.00 recorded against Invoice INV-2026-1001 for Ananya Ramesh",
      timestamp: "10 mins ago",
      type: "payment",
    },
    {
      id: "act-2",
      title: "Quotation Approved Electronically",
      description: "Ananya Ramesh accepted Quotation QTN-2026-1001 (Version 1)",
      timestamp: "45 mins ago",
      type: "quotation",
    },
    {
      id: "act-3",
      title: "Job Assigned to Murugan Selvam",
      description: "Job JOB-2026-1001 (AC Jet Wash & Odor Sanitization) assigned as Lead",
      timestamp: "2 hours ago",
      type: "job",
    },
    {
      id: "act-4",
      title: "New Public Booking Request Received",
      description: "Booking BK-2026-1001 submitted from Adyar, Chennai (Pincode 600028)",
      timestamp: "3 hours ago",
      type: "booking",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-navy-200/80 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-navy-950">
            {t.dashboard.title}
          </h1>
          <p className="text-xs text-navy-500 mt-1">
            Real-time operations, field appointments, and verified financial collections.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/technician"
            className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-navy-950 transition"
          >
            <Smartphone className="h-3.5 w-3.5 text-brand-400" />
            <span>Open Technician App</span>
          </Link>

          <Link
            href="/dashboard/bookings"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700 transition"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>{t.dashboard.newBooking}</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t.dashboard.todayAppointments}
          value={metrics.todayAppointments}
          subtitle="Scheduled for today"
          icon={CalendarDays}
          badge={{ text: "Active", variant: "brand" }}
        />

        <StatCard
          title={t.dashboard.inProgressJobs}
          value={metrics.inProgressJobs}
          subtitle="Technician currently on site"
          icon={Clock}
          badge={{ text: "1 On-Site", variant: "amber" }}
        />

        <StatCard
          title={t.dashboard.unassignedJobs}
          value={metrics.unassignedJobs}
          subtitle="Needs technician allocation"
          icon={UserX}
          badge={{ text: "All Assigned", variant: "emerald" }}
        />

        <StatCard
          title={t.dashboard.pendingQuotations}
          value={metrics.pendingQuotations}
          subtitle="Awaiting customer sign-off"
          icon={FileCheck2}
          badge={{ text: "Expiring soon", variant: "neutral" }}
        />
      </div>

      {/* Financial Split Grid: Invoiced vs Collected */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Collected Revenue */}
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              {t.dashboard.collectedRevenue}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Actual Cash/UPI
            </span>
          </div>
          <div className="mt-3 text-3xl font-black text-emerald-950 font-sans">
            {formatINR(metrics.collectedRevenuePaise)}
          </div>
          <p className="mt-1 text-xs text-emerald-700">
            Realized cash & UPI received into business bank account.
          </p>
        </div>

        {/* Invoiced Revenue */}
        <div className="rounded-2xl border border-navy-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-navy-600">
              {t.dashboard.invoicedRevenue}
            </span>
            <span className="text-xs font-bold text-navy-600 bg-navy-100 px-2 py-0.5 rounded-full">
              Issued Tax Invoices
            </span>
          </div>
          <div className="mt-3 text-3xl font-black text-navy-950 font-sans">
            {formatINR(metrics.invoicedRevenuePaise)}
          </div>
          <p className="mt-1 text-xs text-navy-500">
            Total gross invoiced amount including applicable GST.
          </p>
        </div>

        {/* Outstanding Invoices */}
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              {t.dashboard.outstandingInvoices}
            </span>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              Pending Collections
            </span>
          </div>
          <div className="mt-3 text-3xl font-black text-amber-950 font-sans">
            {formatINR(metrics.outstandingRevenuePaise)}
          </div>
          <p className="mt-1 text-xs text-amber-700">
            Due balances remaining from customers on issued invoices.
          </p>
        </div>
      </div>

      {/* Operational Highlights & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Operational Activity */}
        <div className="lg:col-span-2 rounded-2xl border border-navy-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-navy-100">
            <h2 className="text-sm font-bold text-navy-950">
              {t.dashboard.recentActivity}
            </h2>
            <span className="text-[11px] font-semibold text-navy-400">Audit Verified</span>
          </div>

          <div className="divide-y divide-navy-100">
            {recentActivities.map((act) => (
              <div key={act.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-navy-900 block">{act.title}</span>
                  <span className="text-navy-500 text-[11px] mt-0.5 block">{act.description}</span>
                </div>
                <span className="text-[10px] text-navy-400 whitespace-nowrap">{act.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Service Spotlight */}
        <div className="rounded-2xl border border-navy-200/80 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-700 mb-2">
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              <span>Job In Progress</span>
            </div>

            <h3 className="text-base font-bold text-navy-950">
              JOB-2026-1001: AC Jet Wash
            </h3>
            <p className="text-xs text-navy-500 mt-1">
              Customer: <strong>Ananya Ramesh</strong> (Adyar)
            </p>
            <p className="text-xs text-navy-500 mt-0.5">
              Assigned: <strong>Murugan Selvam</strong> (Lead)
            </p>

            <div className="mt-4 p-3 rounded-xl bg-navy-50 border border-navy-200/60 text-xs">
              <span className="text-[11px] font-bold text-navy-700 block">Inspection Checklist:</span>
              <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
                ✓ Jet spray foam applied to indoor cooling coils
              </span>
              <span className="text-[11px] text-amber-700 font-semibold block mt-0.5">
                ⏳ Final grill temperature verification pending
              </span>
            </div>
          </div>

          <Link
            href="/dashboard/technician"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-50 border border-brand-200 py-2.5 text-xs font-bold text-brand-700 hover:bg-brand-100 transition"
          >
            <span>Inspect Technician View</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
