"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { formatINR } from "@/lib/money";
import {
  Briefcase,
  UserCheck,
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  PlusCircle,
  FileCheck2,
  Receipt,
  UserX,
  Filter,
  AlertTriangle,
  X,
  ChevronRight,
  ShieldCheck,
  Phone,
} from "lucide-react";

interface JobItem {
  id: string;
  jobNumber: string;
  title: string;
  customerName: string;
  customerPhone: string;
  address: string;
  scheduledTime: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  technicianId?: string;
  technicianName?: string;
  status: "SCHEDULED" | "EN_ROUTE" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "NORMAL" | "HIGH" | "EMERGENCY";
  service: string;
  quotationNumber?: string;
  invoiceNumber?: string;
}

interface WorkerRoster {
  id: string;
  name: string;
  phone: string;
  assignedCount: number;
}

export default function JobsSchedulingPage() {
  const { t } = useTranslation();

  const [viewMode, setViewMode] = useState<"LIST" | "CALENDAR">("LIST");
  const [selectedDate, setSelectedDate] = useState("2026-10-12");
  const [selectedWorkerFilter, setSelectedWorkerFilter] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");

  // Scheduling Conflict Banner State
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  // Job Details Drawer State
  const [activeJobDetails, setActiveJobDetails] = useState<JobItem | null>(null);

  // Assignment Modal State
  const [assigningJob, setAssigningJob] = useState<JobItem | null>(null);
  const [targetTechId, setTargetTechId] = useState("tech-1");
  const [assignStartTime, setAssignStartTime] = useState("14:00");
  const [assignEndTime, setAssignEndTime] = useState("16:00");

  const technicians: WorkerRoster[] = [
    { id: "tech-1", name: "Murugan Selvam", phone: "+91 98401 23456", assignedCount: 2 },
    { id: "tech-2", name: "K. Karthikeyan", phone: "+91 98402 34567", assignedCount: 1 },
    { id: "tech-3", name: "R. Venkatesh", phone: "+91 98403 45678", assignedCount: 0 },
  ];

  const [jobs, setJobs] = useState<JobItem[]>([
    {
      id: "j-1",
      jobNumber: "JOB-2026-1001",
      title: "AC Jet Wash & Odor Sanitization",
      customerName: "Ananya Ramesh",
      customerPhone: "+91 98400 11223",
      address: "Flat 2B, Green Palms Apartment, Adyar, 600028",
      scheduledTime: "10:00 AM - 12:00 PM",
      startTime: "10:00",
      endTime: "12:00",
      technicianId: "tech-1",
      technicianName: "Murugan Selvam",
      status: "IN_PROGRESS",
      priority: "HIGH",
      service: "Jet Pump Deep Cleaning & Coil Sanitization",
      quotationNumber: "QTN-2026-1001",
      invoiceNumber: "INV-2026-1001",
    },
    {
      id: "j-2",
      jobNumber: "JOB-2026-1002",
      title: "1.5T Inverter Split AC Installation",
      customerName: "Senthil Nathan",
      customerPhone: "+91 98400 22334",
      address: "18, Thanikachalam Road, T. Nagar, 600017",
      scheduledTime: "02:00 PM - 04:00 PM",
      startTime: "14:00",
      endTime: "16:00",
      technicianId: "tech-1",
      technicianName: "Murugan Selvam",
      status: "SCHEDULED",
      priority: "NORMAL",
      service: "Split AC Standard Installation (1 - 2 Ton)",
      quotationNumber: "QTN-2026-1002",
    },
    {
      id: "j-3",
      jobNumber: "JOB-2026-1003",
      title: "AC Compressor & Gas Pressure Testing",
      customerName: "Vijay Anand",
      customerPhone: "+91 98400 33445",
      address: "12, 4th Main Road, Besant Nagar, 600090",
      scheduledTime: "11:00 AM - 01:00 PM",
      startTime: "11:00",
      endTime: "13:00",
      technicianId: "tech-2",
      technicianName: "K. Karthikeyan",
      status: "SCHEDULED",
      priority: "NORMAL",
      service: "AC Gas Leakage Diagnosis & Refill",
    },
  ]);

  const [unassignedJobs, setUnassignedJobs] = useState<JobItem[]>([
    {
      id: "j-unassigned-1",
      jobNumber: "JOB-2026-1004",
      title: "Inverter PCB Error Diagnostic Assessment",
      customerName: "Praveen Kumar",
      customerPhone: "+91 98400 44556",
      address: "8, First Seaward Road, Valmiki Nagar, 600041",
      scheduledTime: "Unscheduled",
      startTime: "14:00",
      endTime: "16:00",
      status: "SCHEDULED",
      priority: "HIGH",
      service: "Inverter PCB Circuit Diagnosis & Repair",
    },
  ]);

  // Handle accessible form assignment with conflict detection
  const handleConfirmAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningJob) return;

    setConflictWarning(null);
    setAssignSuccess(null);

    const tech = technicians.find((t) => t.id === targetTechId);
    if (!tech) return;

    // Check conflict against existing jobs for this technician
    const existingOverlaps = jobs.filter((j) => {
      if (j.id === assigningJob.id) return false;
      if (j.technicianId !== targetTechId) return false;
      if (j.status === "COMPLETED" || j.status === "CANCELLED") return false;

      // Overlap: existingStart < proposedEnd AND existingEnd > proposedStart
      return j.startTime < assignEndTime && j.endTime > assignStartTime;
    });

    if (existingOverlaps.length > 0) {
      const conflict = existingOverlaps[0];
      setConflictWarning(
        `SCHEDULING CONFLICT DETECTED: ${tech.name} is already booked on ${conflict.jobNumber} (${conflict.title}) from ${conflict.startTime} to ${conflict.endTime}. Please choose a non-overlapping time or assign another technician.`
      );
      return;
    }

    try {
      await fetch(`/api/jobs/${assigningJob.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          technicianUserId: targetTechId,
          scheduledStartTime: `2026-10-12T${assignStartTime}:00`,
          scheduledEndTime: `2026-10-12T${assignEndTime}:00`,
        }),
      });

      // Update state
      const updatedJob: JobItem = {
        ...assigningJob,
        technicianId: targetTechId,
        technicianName: tech.name,
        startTime: assignStartTime,
        endTime: assignEndTime,
        scheduledTime: `${assignStartTime} - ${assignEndTime}`,
        status: "SCHEDULED",
      };

      setJobs((prev) => [...prev.filter((j) => j.id !== assigningJob.id), updatedJob]);
      setUnassignedJobs((prev) => prev.filter((j) => j.id !== assigningJob.id));

      setAssignSuccess(
        `Successfully assigned ${updatedJob.jobNumber} to ${tech.name} (${assignStartTime} - ${assignEndTime}).`
      );
      setAssigningJob(null);
      setTimeout(() => setAssignSuccess(null), 4000);
    } catch {
      // In offline preview mode update UI seamlessly
      const updatedJob: JobItem = {
        ...assigningJob,
        technicianId: targetTechId,
        technicianName: tech.name,
        startTime: assignStartTime,
        endTime: assignEndTime,
        scheduledTime: `${assignStartTime} - ${assignEndTime}`,
        status: "SCHEDULED",
      };
      setJobs((prev) => [...prev.filter((j) => j.id !== assigningJob.id), updatedJob]);
      setUnassignedJobs((prev) => prev.filter((j) => j.id !== assigningJob.id));
      setAssignSuccess(`Assigned ${updatedJob.jobNumber} to ${tech.name}.`);
      setAssigningJob(null);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    if (selectedWorkerFilter !== "ALL" && j.technicianId !== selectedWorkerFilter)
      return false;
    if (selectedStatusFilter !== "ALL" && j.status !== selectedStatusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-navy-200/80 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-navy-950">
            Dispatch Workspace & Scheduling Calendar
          </h1>
          <p className="text-xs text-navy-500 mt-1">
            Assign jobs, manage technician day schedules, detect timing conflicts, and review inspection history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-100 p-1 border border-navy-200">
            <button
              onClick={() => setViewMode("LIST")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "LIST"
                  ? "bg-white text-navy-950 shadow-sm"
                  : "text-navy-600 hover:text-navy-900"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode("CALENDAR")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "CALENDAR"
                  ? "bg-white text-navy-950 shadow-sm"
                  : "text-navy-600 hover:text-navy-900"
              }`}
            >
              Timeline Calendar
            </button>
          </div>

          <Link
            href="/dashboard/technician"
            className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-navy-950 transition"
          >
            <Smartphone className="h-3.5 w-3.5 text-teal-400" />
            <span>Open Field App</span>
          </Link>
        </div>
      </div>

      {/* Conflict / Success Alert Banners */}
      {conflictWarning && (
        <div className="rounded-xl bg-amber-50 border border-amber-300 p-4 text-xs font-semibold text-amber-900 flex items-start justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>{conflictWarning}</span>
          </div>
          <button
            onClick={() => setConflictWarning(null)}
            className="text-amber-700 hover:text-amber-950 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {assignSuccess && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-900 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{assignSuccess}</span>
        </div>
      )}

      {/* Unassigned Jobs Panel */}
      {unassignedJobs.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/50 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-amber-600" />
              <h2 className="text-sm font-black text-navy-950">
                Unassigned Jobs Pending Dispatch ({unassignedJobs.length})
              </h2>
            </div>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unassignedJobs.map((uj) => (
              <div
                key={uj.id}
                className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm flex items-center justify-between gap-3"
              >
                <div>
                  <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {uj.jobNumber}
                  </span>
                  <h3 className="text-xs font-black text-navy-950 mt-1">{uj.title}</h3>
                  <p className="text-[11px] text-navy-500 mt-0.5">
                    {uj.customerName} • {uj.address}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setConflictWarning(null);
                    setAssigningJob(uj);
                  }}
                  className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 text-xs font-bold shadow-sm whitespace-nowrap transition"
                >
                  Assign Worker
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-navy-200/80 shadow-sm text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-navy-500 font-bold">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter:</span>
          </div>

          {/* Worker Filter */}
          <select
            value={selectedWorkerFilter}
            onChange={(e) => setSelectedWorkerFilter(e.target.value)}
            className="rounded-lg border border-navy-300 px-2.5 py-1.5 text-xs font-medium text-navy-900 bg-white"
          >
            <option value="ALL">All Technicians</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.assignedCount} jobs)
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="rounded-lg border border-navy-300 px-2.5 py-1.5 text-xs font-medium text-navy-900 bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="EN_ROUTE">En Route</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-navy-500">Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-lg border border-navy-300 px-2 py-1 text-xs font-semibold text-navy-900"
          />
        </div>
      </div>

      {/* Main View: Timeline Calendar or Job List */}
      {viewMode === "CALENDAR" ? (
        /* Timeline View */
        <div className="bg-white rounded-2xl border border-navy-200/80 p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-navy-950 border-b border-navy-100 pb-2">
            Technician Timeline Schedule ({selectedDate})
          </h2>

          <div className="space-y-4">
            {technicians.map((tech) => {
              const techJobs = jobs.filter((j) => j.technicianId === tech.id);
              return (
                <div key={tech.id} className="p-4 rounded-xl bg-slate-50 border border-navy-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-teal-600" />
                      <span className="text-xs font-bold text-navy-950">{tech.name}</span>
                      <span className="text-[11px] text-navy-500">{tech.phone}</span>
                    </div>
                    <span className="text-[11px] font-bold text-navy-600">
                      {techJobs.length} Booked Shifts
                    </span>
                  </div>

                  {/* Day schedule row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    {techJobs.map((tj) => (
                      <div
                        key={tj.id}
                        onClick={() => setActiveJobDetails(tj)}
                        className="p-2.5 rounded-lg bg-white border border-teal-200 hover:border-teal-500 cursor-pointer shadow-sm text-xs transition"
                      >
                        <div className="flex justify-between font-bold text-[11px]">
                          <span className="text-teal-700 font-mono">{tj.jobNumber}</span>
                          <span className="text-navy-500">{tj.scheduledTime}</span>
                        </div>
                        <div className="font-bold text-navy-950 mt-1 truncate">{tj.title}</div>
                        <div className="text-[11px] text-navy-500 truncate">{tj.customerName}</div>
                      </div>
                    ))}
                    {techJobs.length === 0 && (
                      <div className="col-span-3 text-center py-3 text-xs text-navy-400 font-medium">
                        No scheduled jobs on this date. Available for assignment.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredJobs.map((j) => (
            <div
              key={j.id}
              className="bg-white rounded-2xl border border-navy-200/80 p-5 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-md">
                    {j.jobNumber}
                  </span>
                  <span className="text-sm font-black text-navy-950">{j.title}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      j.priority === "HIGH"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-slate-100 text-navy-600"
                    }`}
                  >
                    {j.priority}
                  </span>

                  <span
                    className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      j.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-800"
                        : j.status === "IN_PROGRESS"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {j.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-navy-400 block">
                    Customer & Site
                  </span>
                  <span className="font-bold text-navy-900 block">{j.customerName}</span>
                  <span className="text-navy-500 block truncate">{j.address}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-navy-400 block">
                    Assigned Lead Technician
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <UserCheck className="h-4 w-4 text-teal-600" />
                    <span className="font-bold text-navy-900">
                      {j.technicianName || "Unassigned"}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-navy-400 block">
                    Scheduled Time
                  </span>
                  <div className="flex items-center gap-1 mt-0.5 text-navy-800 font-semibold">
                    <Clock className="h-3.5 w-3.5 text-navy-400" />
                    <span>{j.scheduledTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => {
                      setConflictWarning(null);
                      setAssigningJob(j);
                    }}
                    className="rounded-lg border border-navy-300 hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-navy-800 transition"
                  >
                    Reassign
                  </button>
                  <button
                    onClick={() => setActiveJobDetails(j)}
                    className="rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-3 py-1.5 text-xs font-bold transition"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accessible Assignment / Reassignment Modal with Conflict Enforcement */}
      {assigningJob && (
        <div className="fixed inset-0 z-50 bg-navy-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-navy-200 space-y-4">
            <div className="flex items-center justify-between border-b border-navy-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {assigningJob.jobNumber}
                </span>
                <h3 className="text-sm font-black text-navy-950 mt-1">
                  Assign Technician & Shift Window
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAssigningJob(null)}
                className="text-navy-400 hover:text-navy-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmAssignment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-navy-700 mb-1">
                  Select Lead Technician
                </label>
                <select
                  value={targetTechId}
                  onChange={(e) => setTargetTechId(e.target.value)}
                  className="w-full rounded-lg border border-navy-300 px-3 py-2 text-navy-900 focus:border-teal-500 focus:outline-none bg-white font-medium"
                >
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.assignedCount} active jobs today)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-navy-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={assignStartTime}
                    onChange={(e) => setAssignStartTime(e.target.value)}
                    className="w-full rounded-lg border border-navy-300 px-3 py-2 text-navy-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-navy-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={assignEndTime}
                    onChange={(e) => setAssignEndTime(e.target.value)}
                    className="w-full rounded-lg border border-navy-300 px-3 py-2 text-navy-900"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 border border-navy-200 p-3 space-y-1">
                <span className="text-[10px] font-bold uppercase text-navy-500 block">
                  Customer & Site
                </span>
                <span className="font-bold text-navy-900 block">{assigningJob.customerName}</span>
                <span className="text-navy-500 block">{assigningJob.address}</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningJob(null)}
                  className="px-4 py-2 rounded-xl border border-navy-200 text-navy-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 shadow-sm"
                >
                  Verify & Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Job Details Drawer */}
      {activeJobDetails && (
        <div className="fixed inset-0 z-50 bg-navy-950/40 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-navy-100 pb-3">
                <div>
                  <span className="font-mono text-xs font-black text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                    {activeJobDetails.jobNumber}
                  </span>
                  <h2 className="text-base font-black text-navy-950 mt-1">
                    {activeJobDetails.title}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveJobDetails(null)}
                  className="text-navy-400 hover:text-navy-700 font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {/* Customer Scope */}
              <div className="rounded-xl bg-slate-50 border border-navy-200 p-4 space-y-2 text-xs">
                <span className="text-[10px] font-black uppercase text-navy-500 block">
                  Customer & Address
                </span>
                <div className="font-bold text-navy-950 text-sm">
                  {activeJobDetails.customerName}
                </div>
                <div className="text-navy-600 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-teal-600" />
                  <span>{activeJobDetails.customerPhone}</span>
                </div>
                <div className="text-navy-500 flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-navy-400 flex-shrink-0 mt-0.5" />
                  <span>{activeJobDetails.address}</span>
                </div>
              </div>

              {/* Service & Financial Scope */}
              <div className="rounded-xl bg-slate-50 border border-navy-200 p-4 space-y-2 text-xs">
                <span className="text-[10px] font-black uppercase text-navy-500 block">
                  Scope & Documents
                </span>
                <div className="flex justify-between">
                  <span className="text-navy-500">Service:</span>
                  <span className="font-bold text-navy-900">{activeJobDetails.service}</span>
                </div>
                {activeJobDetails.quotationNumber && (
                  <div className="flex justify-between">
                    <span className="text-navy-500">Quotation:</span>
                    <span className="font-mono font-bold text-teal-700">
                      {activeJobDetails.quotationNumber}
                    </span>
                  </div>
                )}
                {activeJobDetails.invoiceNumber && (
                  <div className="flex justify-between">
                    <span className="text-navy-500">Invoice:</span>
                    <span className="font-mono font-bold text-teal-700">
                      {activeJobDetails.invoiceNumber}
                    </span>
                  </div>
                )}
              </div>

              {/* Inspection Safety Checklist Status */}
              <div className="rounded-xl bg-slate-50 border border-navy-200 p-4 space-y-2 text-xs">
                <span className="text-[10px] font-black uppercase text-navy-500 block">
                  Required Checklist Status
                </span>
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Server-Enforced Checklist (8 mandatory items)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-navy-100 flex items-center justify-between">
              <Link
                href="/dashboard/technician"
                className="text-xs font-bold text-teal-700 hover:text-teal-900"
              >
                Open in Field Mode →
              </Link>
              <button
                type="button"
                onClick={() => setActiveJobDetails(null)}
                className="px-4 py-2 rounded-xl bg-navy-100 hover:bg-navy-200 text-xs font-bold text-navy-800"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
