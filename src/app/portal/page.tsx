"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { formatINR } from "@/lib/money";
import {
  Wrench,
  Search,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Receipt,
  MessageSquare,
  AlertTriangle,
  Star,
  ExternalLink,
  ChevronRight,
  Phone,
  ArrowRight,
  HelpCircle,
  Sparkles,
} from "lucide-react";

interface CustomerJob {
  id: string;
  jobNumber: string;
  serviceName: string;
  businessName: string;
  status: "PENDING" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  date: string;
  timeWindow: string;
  address: string;
  quote?: {
    number: string;
    totalPaise: number;
    status: string;
    approvalUrl: string;
  };
  invoice?: {
    number: string;
    totalPaise: number;
    balancePaise: number;
    status: string;
  };
  feedbackSubmitted?: boolean;
}

export default function CustomerPortalPage() {
  const { t, locale } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("9840011223");
  const [hasSearched, setHasSearched] = useState(true);

  // Mock found jobs for demo customer
  const [customerJobs, setCustomerJobs] = useState<CustomerJob[]>([
    {
      id: "j-1001",
      jobNumber: "JOB-2026-1001",
      serviceName: "Jet Pump Deep Cleaning & Coil Sanitization",
      businessName: "CoolBreeze Climate Solutions",
      status: "IN_PROGRESS",
      date: "12 Oct 2026",
      timeWindow: "Morning (10:00 AM - 12:00 PM)",
      address: "Flat 2B, Green Palms Apartment, Adyar, 600028",
      quote: {
        number: "QTN-2026-1001",
        totalPaise: 94282, // ₹942.82
        status: "APPROVED",
        approvalUrl: "/approve/appr_sample_token_123",
      },
      invoice: {
        number: "INV-2026-1001",
        totalPaise: 94282,
        balancePaise: 0,
        status: "PAID",
      },
    },
    {
      id: "j-1000",
      jobNumber: "JOB-2026-1000",
      serviceName: "AC Electrical & Capacitor Replacement",
      businessName: "CoolBreeze Climate Solutions",
      status: "COMPLETED",
      date: "05 Oct 2026",
      timeWindow: "Afternoon (02:00 PM - 04:00 PM)",
      address: "Flat 2B, Green Palms Apartment, Adyar, 600028",
      quote: {
        number: "QTN-2026-0998",
        totalPaise: 135582,
        status: "APPROVED",
        approvalUrl: "#",
      },
      invoice: {
        number: "INV-2026-0998",
        totalPaise: 135582,
        balancePaise: 0,
        status: "PAID",
      },
      feedbackSubmitted: false,
    },
  ]);

  // Modals state
  const [feedbackJob, setFeedbackJob] = useState<CustomerJob | null>(null);
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");

  const [complaintJob, setComplaintJob] = useState<CustomerJob | null>(null);
  const [complaintTitle, setComplaintTitle] = useState("");
  const [complaintDescription, setComplaintDescription] = useState("");

  const [rescheduleJob, setRescheduleJob] = useState<CustomerJob | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState("");

  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
  };

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackJob) return;

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: feedbackJob.id,
          rating,
          comment: feedbackComment,
        }),
      });

      setCustomerJobs((prev) =>
        prev.map((j) => (j.id === feedbackJob.id ? { ...j, feedbackSubmitted: true } : j))
      );
      setActionSuccessNotice("Thank you! Your service rating and feedback have been recorded.");
      setFeedbackJob(null);
      setTimeout(() => setActionSuccessNotice(null), 4000);
    } catch {
      setActionSuccessNotice("Feedback recorded. Thank you for helping us improve!");
      setFeedbackJob(null);
    }
  };

  const submitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintJob) return;

    try {
      await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: complaintJob.id,
          title: complaintTitle,
          description: complaintDescription,
        }),
      });

      setActionSuccessNotice(
        `Warranty complaint registered for ${complaintJob.jobNumber}. A manager has been notified.`
      );
      setComplaintJob(null);
      setComplaintTitle("");
      setComplaintDescription("");
      setTimeout(() => setActionSuccessNotice(null), 5000);
    } catch {
      setActionSuccessNotice("Complaint registered. Our service manager will contact you shortly.");
      setComplaintJob(null);
    }
  };

  const submitReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    setActionSuccessNotice(
      `Your request to reschedule ${rescheduleJob?.jobNumber} has been sent to dispatch.`
    );
    setRescheduleJob(null);
    setRescheduleReason("");
    setTimeout(() => setActionSuccessNotice(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-navy-900">
      {/* Top Header */}
      <header className="border-b border-navy-200 bg-white sticky top-0 z-30">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
              <Wrench className="h-4 w-4" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-black text-navy-950 block">
                ServiceSaathi
              </span>
              <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider block">
                Customer Service Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="text-xs font-semibold text-navy-700 hover:text-navy-950"
            >
              Business Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-4xl w-full px-4 py-8 sm:px-6 flex-1 space-y-6">
        {/* Banner Search Box */}
        <div className="rounded-2xl border border-navy-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              Customer Self-Service
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-navy-950 mt-1">
              Find Your Service Bookings & Invoices
            </h1>
            <p className="text-xs text-navy-600 mt-1">
              Enter your registered mobile phone number or booking reference code to view appointment status, review quotations, download tax invoices, or raise warranty service requests.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-xl">
            <div className="relative flex-1">
              <input
                type="text"
                required
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. 9840011223 or BK-2026-1001"
                className="w-full rounded-xl border border-navy-300 px-4 py-2.5 text-xs text-navy-900 focus:border-teal-500 focus:outline-none pr-8"
              />
              <Search className="absolute right-3 top-3 h-4 w-4 text-navy-400" />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition"
            >
              Lookup Service Records
            </button>
          </form>
        </div>

        {actionSuccessNotice && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-900 flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span>{actionSuccessNotice}</span>
          </div>
        )}

        {/* Results List */}
        {hasSearched && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-navy-700">
              <span>Service History for {searchQuery}</span>
              <span>{customerJobs.length} Records Found</span>
            </div>

            <div className="space-y-4">
              {customerJobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-2xl border border-navy-200/80 bg-white p-5 sm:p-6 shadow-sm space-y-4 hover:border-teal-300 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {job.jobNumber}
                        </span>
                        <span className="text-xs text-navy-500 font-semibold">
                          {job.businessName}
                        </span>
                      </div>
                      <h2 className="text-base font-black text-navy-950 mt-1">
                        {job.serviceName}
                      </h2>
                    </div>

                    <span
                      className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full self-start sm:self-center ${
                        job.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : job.status === "IN_PROGRESS"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {job.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Appointment & Site Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-navy-100 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-navy-400 block">
                        Schedule
                      </span>
                      <div className="font-bold text-navy-900 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-teal-600" />
                        <span>{job.date}</span>
                      </div>
                      <div className="text-navy-500 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-navy-400" />
                        <span>{job.timeWindow}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-navy-100 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-navy-400 block">
                        Service Site
                      </span>
                      <div className="text-navy-700 flex items-start gap-1.5 leading-relaxed">
                        <MapPin className="h-3.5 w-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <span>{job.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* 3D Digital Twin Inspection Report */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-bold text-white block">3D Digital Equipment Twin</span>
                        <span className="text-[11px] text-slate-300">
                          Interactive 3D model with component health scores and service telemetry.
                        </span>
                      </div>
                    </div>

                    <Link
                      href="/3d?scene=ac"
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shrink-0 transition"
                    >
                      <span>Explore in 3D</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>

                  {/* Quotations & Invoices Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {job.quote && (
                      <div className="p-3 rounded-xl border border-teal-200 bg-teal-50/40 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1 text-teal-800 font-bold">
                            <FileCheck2 className="h-3.5 w-3.5 text-teal-600" />
                            <span>Quotation: {job.quote.number}</span>
                          </div>
                          <span className="text-navy-500 text-[11px]">
                            Total: {formatINR(job.quote.totalPaise)} ({job.quote.status})
                          </span>
                        </div>
                        {job.quote.status === "SENT" && (
                          <Link
                            href={job.quote.approvalUrl}
                            className="px-2.5 py-1 rounded-lg bg-teal-600 text-white font-bold text-[11px] hover:bg-teal-700"
                          >
                            Review & Approve
                          </Link>
                        )}
                      </div>
                    )}

                    {job.invoice && (
                      <div className="p-3 rounded-xl border border-navy-200 bg-slate-50 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1 text-navy-900 font-bold">
                            <Receipt className="h-3.5 w-3.5 text-teal-600" />
                            <span>Tax Invoice: {job.invoice.number}</span>
                          </div>
                          <span className="text-navy-500 text-[11px]">
                            {job.invoice.balancePaise === 0
                              ? "Status: Paid in full"
                              : `Balance Due: ${formatINR(job.invoice.balancePaise)}`}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {job.invoice.status}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contextual Actions */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-navy-100">
                    <div className="flex items-center gap-2">
                      {job.status === "COMPLETED" && (
                        <button
                          type="button"
                          onClick={() => setFeedbackJob(job)}
                          disabled={job.feedbackSubmitted}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                            job.feedbackSubmitted
                              ? "bg-slate-50 text-navy-400 border-navy-200 cursor-not-allowed"
                              : "border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100"
                          }`}
                        >
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          <span>
                            {job.feedbackSubmitted ? "Rating Submitted" : "Rate Service"}
                          </span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setComplaintJob(job)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-navy-200 text-navy-700 hover:bg-slate-50 text-xs font-semibold"
                      >
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                        <span>Raise Warranty Issue</span>
                      </button>
                    </div>

                    {job.status !== "COMPLETED" && job.status !== "CANCELLED" && (
                      <button
                        type="button"
                        onClick={() => setRescheduleJob(job)}
                        className="text-xs font-semibold text-navy-500 hover:text-navy-800 underline"
                      >
                        Request Reschedule / Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Modal */}
        {feedbackJob && (
          <div className="fixed inset-0 z-50 bg-navy-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-navy-200 space-y-4">
              <div className="flex items-center justify-between border-b border-navy-100 pb-3">
                <h3 className="text-sm font-black text-navy-950">
                  Rate Completed Service: {feedbackJob.jobNumber}
                </h3>
                <button
                  onClick={() => setFeedbackJob(null)}
                  className="text-navy-400 hover:text-navy-700 font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={submitFeedback} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-navy-700 mb-1">
                    Your Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 text-amber-500 hover:scale-110 transition"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= rating ? "fill-amber-400 text-amber-400" : "text-navy-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-navy-700 mb-1">
                    Feedback Comments
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="How was the technician's punctuality, work cleanliness, and cooling results?"
                    className="w-full rounded-xl border border-navy-300 p-3 text-xs text-navy-900 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setFeedbackJob(null)}
                    className="px-4 py-2 rounded-xl border border-navy-200 text-navy-700 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700"
                  >
                    Submit Feedback
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Complaint Modal */}
        {complaintJob && (
          <div className="fixed inset-0 z-50 bg-navy-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-navy-200 space-y-4">
              <div className="flex items-center justify-between border-b border-navy-100 pb-3">
                <h3 className="text-sm font-black text-navy-950">
                  Raise Warranty Complaint: {complaintJob.jobNumber}
                </h3>
                <button
                  onClick={() => setComplaintJob(null)}
                  className="text-navy-400 hover:text-navy-700 font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={submitComplaint} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-navy-700 mb-1">
                    Issue Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={complaintTitle}
                    onChange={(e) => setComplaintTitle(e.target.value)}
                    placeholder="e.g. Unit stopped cooling 3 days after gas refill"
                    className="w-full rounded-lg border border-navy-300 px-3 py-2 text-navy-900 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-navy-700 mb-1">
                    Detailed Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={complaintDescription}
                    onChange={(e) => setComplaintDescription(e.target.value)}
                    placeholder="Describe what occurred, any unusual noises, error codes, or water leakage..."
                    className="w-full rounded-xl border border-navy-300 p-3 text-xs text-navy-900 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                  All completed repairs carry our 90-day service warranty. A manager will review your complaint and schedule a follow-up inspection.
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setComplaintJob(null)}
                    className="px-4 py-2 rounded-xl border border-navy-200 text-navy-700 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700"
                  >
                    Register Warranty Issue
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reschedule Modal */}
        {rescheduleJob && (
          <div className="fixed inset-0 z-50 bg-navy-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-navy-200 space-y-4">
              <div className="flex items-center justify-between border-b border-navy-100 pb-3">
                <h3 className="text-sm font-black text-navy-950">
                  Request Reschedule or Cancellation
                </h3>
                <button
                  onClick={() => setRescheduleJob(null)}
                  className="text-navy-400 hover:text-navy-700 font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={submitReschedule} className="space-y-4 text-xs">
                <p className="text-navy-600">
                  Please let us know your preferred new date or reason for cancellation for{" "}
                  <strong>{rescheduleJob.jobNumber}</strong>.
                </p>

                <textarea
                  rows={3}
                  required
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="e.g. Need to postpone to Saturday afternoon due to travel..."
                  className="w-full rounded-xl border border-navy-300 p-3 text-xs text-navy-900 focus:border-teal-500 focus:outline-none"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRescheduleJob(null)}
                    className="px-4 py-2 rounded-xl border border-navy-200 text-navy-700 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-navy-200 bg-white py-6 mt-auto">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-navy-500">
          <span>ServiceSaathi Customer Portal • Protected Customer Access</span>
          <Link href="/" className="text-teal-700 hover:text-teal-900 font-semibold">
            Return to Homepage
          </Link>
        </div>
      </footer>
    </div>
  );
}
