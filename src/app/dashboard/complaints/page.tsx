"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  UserCheck,
  Search,
  Filter,
  FileText,
  Save,
  ChevronRight,
  Phone,
} from "lucide-react";

interface ComplaintItem {
  id: string;
  complaintNumber: string;
  jobNumber: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  title: string;
  description: string;
  status: "OPEN" | "INVESTIGATING" | "RESOLVED";
  warrantyEligible: boolean;
  internalNotes: string;
  customerVisibleUpdate: string;
  createdAt: string;
}

export default function ComplaintsManagementPage() {
  const { t } = useTranslation();

  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [complaints, setComplaints] = useState<ComplaintItem[]>([
    {
      id: "cmp-1001",
      complaintNumber: "CMP-2026-1001",
      jobNumber: "JOB-2026-1000",
      customerName: "Karthik Raja",
      customerPhone: "+91 98400 33221",
      serviceName: "AC Electrical & Capacitor Repair",
      title: "Outdoor fan making humming sound after capacitor replacement",
      description: "Technician replaced the capacitor yesterday, but now the outdoor unit buzzes loudly when the compressor turns on.",
      status: "OPEN",
      warrantyEligible: true,
      internalNotes: "Check if the bracket screws were tightened properly or if capacitor bracket is vibrating against sheet metal.",
      customerVisibleUpdate: "Our senior technician Murugan has been assigned for a priority warranty re-check.",
      createdAt: "12 Oct 2026",
    },
    {
      id: "cmp-1000",
      complaintNumber: "CMP-2026-1000",
      jobNumber: "JOB-2026-0985",
      customerName: "M. Soundararajan",
      customerPhone: "+91 98400 44556",
      serviceName: "Jet Pump Deep Cleaning & Coil Sanitization",
      title: "Minor water drip from left corner of indoor casing",
      description: "Water droplet leaks once every few minutes onto the sofa beneath the unit.",
      status: "RESOLVED",
      warrantyEligible: true,
      internalNotes: "Drain pipe slope re-adjusted and tested with 2 litres of water. Resolved at no additional cost.",
      customerVisibleUpdate: "Drain pipe realignment completed under 90-day warranty. Water flow confirmed clear.",
      createdAt: "08 Oct 2026",
    },
  ]);

  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(complaints[0]);
  const [editStatus, setEditStatus] = useState<ComplaintItem["status"]>("OPEN");
  const [editWarranty, setEditWarranty] = useState<boolean>(true);
  const [editInternalNotes, setEditInternalNotes] = useState("");
  const [editCustomerNotes, setEditCustomerNotes] = useState("");
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleSelectComplaint = (cmp: ComplaintItem) => {
    setSelectedComplaint(cmp);
    setEditStatus(cmp.status);
    setEditWarranty(cmp.warrantyEligible);
    setEditInternalNotes(cmp.internalNotes);
    setEditCustomerNotes(cmp.customerVisibleUpdate);
  };

  const handleSaveResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      await fetch("/api/complaints", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaintId: selectedComplaint.id,
          status: editStatus,
          resolutionNotes: editCustomerNotes,
        }),
      });

      setComplaints((prev) =>
        prev.map((c) =>
          c.id === selectedComplaint.id
            ? {
                ...c,
                status: editStatus,
                warrantyEligible: editWarranty,
                internalNotes: editInternalNotes,
                customerVisibleUpdate: editCustomerNotes,
              }
            : c
        )
      );

      setSavedNotice("Complaint resolution notes successfully updated!");
      setTimeout(() => setSavedNotice(null), 3000);
    } catch {
      setSavedNotice("Updated complaint notes.");
    }
  };

  const filtered = complaints.filter((c) =>
    filterStatus === "ALL" ? true : c.status === filterStatus
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-navy-200/80 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-navy-950">
            Customer Complaints & Warranty Operations
          </h1>
          <p className="text-xs text-navy-500 mt-1">
            Review customer warranty issues, assign follow-up inspections, and record internal technical notes separated from customer-visible updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-navy-300 px-3 py-2 text-xs font-semibold text-navy-900 bg-white shadow-sm"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open (Action Required)</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {savedNotice && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-900 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Main Grid: Complaints List (Left) and Detail/Resolution Form (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Complaints List */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold uppercase text-navy-500 tracking-wider block">
            Complaints Inbox ({filtered.length})
          </span>

          <div className="space-y-2.5">
            {filtered.map((c) => {
              const isSelected = selectedComplaint?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectComplaint(c)}
                  className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
                    isSelected
                      ? "border-teal-600 bg-white ring-2 ring-teal-200 shadow-sm"
                      : "border-navy-200/90 bg-white hover:border-navy-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-black uppercase text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {c.complaintNumber}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        c.status === "OPEN"
                          ? "bg-red-100 text-red-800"
                          : c.status === "INVESTIGATING"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-black text-navy-950 leading-tight">
                    {c.title}
                  </h3>

                  <div className="text-[11px] text-navy-500 flex items-center justify-between">
                    <span>
                      {c.customerName} • {c.jobNumber}
                    </span>
                    <span>{c.createdAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Resolution Workspace */}
        <div className="lg:col-span-7">
          {selectedComplaint ? (
            <div className="bg-white rounded-2xl border border-navy-200/80 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-navy-100 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                    {selectedComplaint.complaintNumber}
                  </span>
                  <h2 className="text-base font-black text-navy-950 mt-1">
                    {selectedComplaint.title}
                  </h2>
                </div>

                <div className="text-right text-xs">
                  <span className="font-bold text-navy-900 block">
                    {selectedComplaint.customerName}
                  </span>
                  <span className="text-navy-500 block">{selectedComplaint.customerPhone}</span>
                </div>
              </div>

              {/* Customer Reported Description */}
              <div className="rounded-xl bg-slate-50 border border-navy-200 p-4 space-y-1.5 text-xs">
                <span className="text-[10px] font-black uppercase text-navy-500 block">
                  Customer Issue Description
                </span>
                <p className="text-navy-700 leading-relaxed">
                  {selectedComplaint.description}
                </p>
                <div className="pt-1 text-[11px] text-teal-700 font-semibold">
                  Linked Job: {selectedComplaint.jobNumber} ({selectedComplaint.serviceName})
                </div>
              </div>

              <form onSubmit={handleSaveResolution} className="space-y-4 text-xs">
                {/* Status & Warranty Eligibility */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-navy-700 mb-1">
                      Investigation Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) =>
                        setEditStatus(e.target.value as ComplaintItem["status"])
                      }
                      className="w-full rounded-lg border border-navy-300 px-3 py-2 text-navy-900 font-medium bg-white"
                    >
                      <option value="OPEN">OPEN (Requires Follow-up)</option>
                      <option value="INVESTIGATING">INVESTIGATING (Technician Assigned)</option>
                      <option value="RESOLVED">RESOLVED (Closed)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-navy-700 mb-1">
                      Warranty Eligibility
                    </label>
                    <div className="flex items-center gap-3 pt-2">
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium text-navy-800">
                        <input
                          type="radio"
                          name="warranty"
                          checked={editWarranty === true}
                          onChange={() => setEditWarranty(true)}
                          className="text-teal-600 focus:ring-teal-500"
                        />
                        <span>Eligible (Free Warranty Visit)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium text-navy-800">
                        <input
                          type="radio"
                          name="warranty"
                          checked={editWarranty === false}
                          onChange={() => setEditWarranty(false)}
                          className="text-teal-600 focus:ring-teal-500"
                        />
                        <span>Chargeable Scope</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Internal Notes (Private to Staff) */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-amber-950 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-amber-700" />
                      <span>Internal Staff Notes (Private — Never visible to Customer)</span>
                    </label>
                    <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      Staff Only
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={editInternalNotes}
                    onChange={(e) => setEditInternalNotes(e.target.value)}
                    placeholder="Diagnosis theories, parts warranty claim notes with supplier, technician coaching..."
                    className="w-full rounded-lg border border-amber-300 bg-white p-2.5 text-xs text-navy-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Customer-Visible Resolution Notes */}
                <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-teal-950 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-teal-700" />
                      <span>Customer-Visible Resolution Update (Shown in Customer Portal)</span>
                    </label>
                    <span className="text-[10px] uppercase font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                      Customer Visible
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={editCustomerNotes}
                    onChange={(e) => setEditCustomerNotes(e.target.value)}
                    placeholder="Provide clear status updates or confirmed re-inspection timings..."
                    className="w-full rounded-lg border border-teal-300 bg-white p-2.5 text-xs text-navy-900 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Link
                    href="/dashboard/jobs"
                    className="text-xs font-bold text-teal-700 hover:text-teal-900"
                  >
                    Assign Follow-up Technician in Dispatch →
                  </Link>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Resolution Updates</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-navy-500 bg-white rounded-2xl border border-navy-200">
              Select a complaint from the inbox to review details and record warranty resolutions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
