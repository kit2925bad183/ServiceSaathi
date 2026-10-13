"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  Play,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export default function TechnicianTodayPage() {
  const [jobs, setJobs] = useState([
    {
      id: "j-1001",
      jobNumber: "JOB-2026-1001",
      title: "AC Jet Wash & Odor Sanitization",
      customerName: "Ananya Ramesh",
      customerPhone: "+91 98400 11223",
      address: "Flat 2B, Green Palms Apartment, Adyar, 600028",
      timeWindow: "10:00 AM - 12:00 PM",
      status: "IN_PROGRESS",
    },
    {
      id: "j-1003",
      jobNumber: "JOB-2026-1003",
      title: "Run Capacitor Replacement & Gas Check",
      customerName: "Rajesh S",
      customerPhone: "+91 98400 33445",
      address: "14, 2nd Main Road, Gandhi Nagar, 600028",
      timeWindow: "02:30 PM - 04:30 PM",
      status: "SCHEDULED",
    },
  ]);

  const [transitioning, setTransitioning] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleStatusChange = async (jobId: string, targetStatus: "EN_ROUTE" | "IN_PROGRESS") => {
    setTransitioning(jobId);
    try {
      await fetch(`/api/jobs/${jobId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetStatus }),
      });
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: targetStatus } : j))
      );
      setNotice(`Job marked as ${targetStatus.replace("_", " ")}`);
      setTimeout(() => setNotice(null), 3000);
    } catch {
      // Local demo fallback
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: targetStatus } : j))
      );
      setNotice(`Status updated to ${targetStatus.replace("_", " ")}`);
      setTimeout(() => setNotice(null), 3000);
    } finally {
      setTransitioning(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Date Banner */}
      <div className="bg-white rounded-2xl p-4 border border-navy-200/80 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
            Today&apos;s Shift
          </span>
          <h1 className="text-base font-black text-navy-950 mt-1">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "short",
            })}
          </h1>
        </div>
        <div className="text-right">
          <span className="text-xl font-black text-navy-950 font-mono">{jobs.length}</span>
          <span className="text-[10px] text-navy-400 block font-semibold">Assigned Jobs</span>
        </div>
      </div>

      {notice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-3 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Jobs Cards */}
      <div className="space-y-3">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-2xl border border-navy-200/80 p-4 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-[10px] font-bold text-navy-500 bg-slate-100 px-2 py-0.5 rounded">
                  {job.jobNumber}
                </span>
                <h2 className="text-sm font-bold text-navy-950 mt-1">{job.title}</h2>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  job.status === "IN_PROGRESS"
                    ? "bg-teal-50 text-teal-700 border-teal-200"
                    : job.status === "EN_ROUTE"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-slate-50 text-navy-600 border-navy-200"
                }`}
              >
                {job.status.replace("_", " ")}
              </span>
            </div>

            <div className="space-y-1 text-xs text-navy-600">
              <div className="flex items-center gap-2 font-medium text-navy-900">
                <Clock className="h-3.5 w-3.5 text-teal-600 flex-shrink-0" />
                <span>{job.timeWindow}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-navy-400 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">{job.address}</span>
              </div>
            </div>

            {/* Customer & Call buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-navy-100 text-xs">
              <span className="font-semibold text-navy-800">{job.customerName}</span>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${job.customerPhone}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-navy-200 text-navy-700 hover:bg-slate-50 font-semibold"
                >
                  <Phone className="h-3.5 w-3.5 text-teal-600" />
                  <span>Call</span>
                </a>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(job.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-navy-200 text-navy-700 hover:bg-slate-50 font-semibold"
                >
                  <Navigation className="h-3.5 w-3.5 text-blue-600" />
                  <span>Map</span>
                </a>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center gap-2">
              {job.status === "SCHEDULED" && (
                <button
                  onClick={() => handleStatusChange(job.id, "EN_ROUTE")}
                  disabled={transitioning === job.id}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  <span>Mark En Route</span>
                </button>
              )}

              {job.status === "EN_ROUTE" && (
                <button
                  onClick={() => handleStatusChange(job.id, "IN_PROGRESS")}
                  disabled={transitioning === job.id}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Start Work</span>
                </button>
              )}

              <Link
                href={`/technician/jobs/${job.id}`}
                className="flex-1 py-2.5 rounded-xl border border-navy-200 hover:bg-slate-50 text-navy-900 font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <span>Checklist & Details</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
