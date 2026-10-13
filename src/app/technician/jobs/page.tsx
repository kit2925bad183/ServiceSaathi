"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Filter,
} from "lucide-react";

export default function TechnicianJobsPage() {
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");

  const [allJobs] = useState([
    {
      id: "j-1001",
      jobNumber: "JOB-2026-1001",
      title: "AC Jet Wash & Odor Sanitization",
      customerName: "Ananya Ramesh",
      address: "Adyar, Chennai",
      date: "Today, 10:00 AM",
      status: "IN_PROGRESS",
    },
    {
      id: "j-1003",
      jobNumber: "JOB-2026-1003",
      title: "Run Capacitor Replacement & Gas Check",
      customerName: "Rajesh S",
      address: "Gandhi Nagar, Chennai",
      date: "Today, 02:30 PM",
      status: "SCHEDULED",
    },
    {
      id: "j-1002",
      jobNumber: "JOB-2026-1002",
      title: "1.5T Inverter Split AC Installation",
      customerName: "Senthil Nathan",
      address: "T. Nagar, Chennai",
      date: "Tomorrow, 02:00 PM",
      status: "SCHEDULED",
    },
    {
      id: "j-1000",
      jobNumber: "JOB-2026-1000",
      title: "Split AC Gas Leakage Diagnosis",
      customerName: "Ananya Ramesh",
      address: "Adyar, Chennai",
      date: "05 Oct 2026",
      status: "COMPLETED",
    },
  ]);

  const filtered = allJobs.filter((j) => {
    if (filter === "ACTIVE") return j.status === "SCHEDULED" || j.status === "IN_PROGRESS" || j.status === "EN_ROUTE";
    if (filter === "COMPLETED") return j.status === "COMPLETED";
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-navy-200/80 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-base font-black text-navy-950">Assigned Jobs</h1>
          <p className="text-[11px] text-navy-500 mt-0.5">
            Your schedule across current shifts and completed history.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold text-navy-600">
        <button
          onClick={() => setFilter("ALL")}
          className={`flex-1 py-1.5 rounded-lg transition ${
            filter === "ALL" ? "bg-white text-navy-950 shadow-sm" : "hover:text-navy-950"
          }`}
        >
          All ({allJobs.length})
        </button>
        <button
          onClick={() => setFilter("ACTIVE")}
          className={`flex-1 py-1.5 rounded-lg transition ${
            filter === "ACTIVE" ? "bg-white text-navy-950 shadow-sm" : "hover:text-navy-950"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter("COMPLETED")}
          className={`flex-1 py-1.5 rounded-lg transition ${
            filter === "COMPLETED" ? "bg-white text-navy-950 shadow-sm" : "hover:text-navy-950"
          }`}
        >
          Completed
        </button>
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {filtered.map((j) => (
          <Link
            key={j.id}
            href={`/technician/jobs/${j.id}`}
            className="bg-white rounded-2xl border border-navy-200/80 p-4 shadow-sm hover:shadow-md transition flex items-center justify-between gap-3 block"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-navy-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  {j.jobNumber}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    j.status === "COMPLETED"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : j.status === "IN_PROGRESS"
                      ? "bg-teal-50 text-teal-700 border-teal-200"
                      : "bg-slate-50 text-navy-600 border-navy-200"
                  }`}
                >
                  {j.status.replace("_", " ")}
                </span>
              </div>
              <h3 className="text-xs font-bold text-navy-950">{j.title}</h3>
              <div className="text-[11px] text-navy-500 flex items-center gap-2">
                <span>{j.customerName}</span>
                <span>•</span>
                <span>{j.date}</span>
              </div>
            </div>

            <ChevronRight className="h-4 w-4 text-navy-400 flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
