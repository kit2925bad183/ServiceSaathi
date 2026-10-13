"use client";

import React, { useState, useEffect } from "react";
import { Activity, Zap, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";

export default function PlatformOperationsPage() {
  const [stats, setStats] = useState({
    outboxPendingCount: 0,
    outboxFailedCount: 0,
    contactRequestsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    setLoading(true);
    fetch("/api/platform/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) {
          setStats(data.stats);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-navy-200/80 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-navy-950">
            System Operations & Queue Health
          </h1>
          <p className="text-xs text-navy-500 mt-1">
            Real-time status of transactional outbox dispatchers, background workers, and email/SMS adapters.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-navy-200 bg-white hover:bg-slate-50 text-xs font-bold text-navy-800 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-navy-200/80 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-navy-500 text-xs font-semibold">
            <span>Outbox Pending Events</span>
            <Zap className="h-4 w-4 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-navy-950 font-mono">
            {stats.outboxPendingCount}
          </div>
          <p className="text-[11px] text-navy-400">
            Events queued in database waiting for background worker poll.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-navy-200/80 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-navy-500 text-xs font-semibold">
            <span>Outbox Failed (Max Retries)</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="text-3xl font-black text-rose-700 font-mono">
            {stats.outboxFailedCount}
          </div>
          <p className="text-[11px] text-navy-400">
            Events failed after 5 exponential retry attempts.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-navy-200/80 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-navy-500 text-xs font-semibold">
            <span>Contact Demo Requests</span>
            <Activity className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-navy-950 font-mono">
            {stats.contactRequestsCount}
          </div>
          <p className="text-[11px] text-navy-400">
            New business leads received via the public website contact form.
          </p>
        </div>
      </div>

      {/* Infrastructure Health Checklist */}
      <div className="bg-white rounded-2xl border border-navy-200/80 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-navy-950">Active Infrastructure Adapters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>PostgreSQL + Prisma Transactional Engine</span>
            </div>
            <p className="text-[11px] text-emerald-800">
              Operational. Enforces foreign key constraints and atomic transaction blocks across bookings and invoices.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Live Server-Sent Events (SSE) Dispatcher</span>
            </div>
            <p className="text-[11px] text-emerald-800">
              Operational at <code>/api/live</code>. Scoped strictly to verified user memberships with heartbeat ping.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Transactional Outbox Worker</span>
            </div>
            <p className="text-[11px] text-emerald-800">
              Operational via <code>npm run worker</code>. Exponential backoff and idempotency verification.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-navy-200 bg-slate-50 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-navy-900">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Payment Gateway (Razorpay Sandbox)</span>
            </div>
            <p className="text-[11px] text-navy-600">
              Sandbox mode active. Webhook signature verification implemented; live keys disabled until production signoff.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
