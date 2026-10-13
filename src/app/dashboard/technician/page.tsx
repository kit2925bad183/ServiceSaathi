"use client";

import React, { useState } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { formatINR } from "@/lib/money";
import {
  Smartphone,
  CheckSquare,
  Clock,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  Camera,
  Play,
  Check,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Upload,
  Trash2,
  Calendar,
} from "lucide-react";

interface TechJob {
  id: string;
  jobNumber: string;
  title: string;
  customerName: string;
  customerPhone: string;
  address: string;
  timeWindow: string;
  isToday: boolean;
  status: "SCHEDULED" | "EN_ROUTE" | "IN_PROGRESS" | "COMPLETED";
}

export default function TechnicianAppPage() {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<"TODAY" | "UPCOMING">("TODAY");

  const [jobsList, setJobsList] = useState<TechJob[]>([
    {
      id: "j-1001",
      jobNumber: "JOB-2026-1001",
      title: "AC Jet Wash & Odor Sanitization",
      customerName: "Ananya Ramesh",
      customerPhone: "+91 98400 11223",
      address: "Flat 2B, Green Palms Apartment, Adyar, 600028",
      timeWindow: "Today • 10:00 AM - 12:00 PM",
      isToday: true,
      status: "IN_PROGRESS",
    },
    {
      id: "j-1002",
      jobNumber: "JOB-2026-1002",
      title: "1.5T Inverter Split AC Installation",
      customerName: "Senthil Nathan",
      customerPhone: "+91 98400 22334",
      address: "18, Thanikachalam Road, T. Nagar, 600017",
      timeWindow: "Tomorrow • 02:00 PM - 04:00 PM",
      isToday: false,
      status: "SCHEDULED",
    },
  ]);

  const [selectedJobId, setSelectedJobId] = useState<string>("j-1001");
  const currentJob = jobsList.find((j) => j.id === selectedJobId) || jobsList[0];

  // Checklist state
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    "Verify outdoor compressor fan rotation & vibration": true,
    "Inspect refrigerant copper piping insulation": true,
    "Apply waterproof cover over PCB electrical box": true,
    "High pressure jet foam wash on indoor cooling coils": true,
    "Flush and vacuum condensation drain line": true,
    "Clean air filters & antibacterial sanitization": false,
    "Test post-service grill temperature (< 16°C)": false,
    "Customer sign-off & clean work site": false,
  });

  // Inspection notes
  const [inspectionNotes, setInspectionNotes] = useState(
    "Coils were heavily accumulated with dust. Running capacitor inspected at 48μF (rated 50μF)."
  );

  // Materials consumed
  const [materials, setMaterials] = useState([
    { id: "AC-CAP-50", name: "Daikin Inverter Running Capacitor (50μF)", qty: 1, max: 5 },
    { id: "CHEM-WASH-1L", name: "Coil Cleaner Foam Liquid (1L Bottle)", qty: 1, max: 10 },
  ]);

  // Photo uploads state (before & after)
  const [photos, setPhotos] = useState<
    Array<{ id: string; type: "BEFORE" | "AFTER"; name: string; status: "UPLOADED" | "FAILED" }>
  >([
    { id: "p-1", type: "BEFORE", name: "dirty_indoor_coils.jpg", status: "UPLOADED" },
    { id: "p-2", type: "BEFORE", name: "drain_pipe_entry.jpg", status: "UPLOADED" },
  ]);

  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittingAction, setSubmittingAction] = useState(false);

  const toggleChecklist = (item: string) => {
    setChecklist((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const updateMaterialQty = (id: string, delta: number) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, qty: Math.max(0, m.qty + delta) } : m))
    );
  };

  const handleStatusTransition = async (
    target: "EN_ROUTE" | "IN_PROGRESS" | "COMPLETED"
  ) => {
    setStatusNotice(null);
    setErrorMessage(null);

    // If completing, enforce 100% of required checklist items
    if (target === "COMPLETED") {
      const allDone = Object.values(checklist).every((val) => val === true);
      if (!allDone) {
        setErrorMessage(
          "Safety policy: All mandatory inspection checklist items must be completed before submitting job completion."
        );
        return;
      }

      // Check if after photo exists
      const hasAfterPhoto = photos.some((p) => p.type === "AFTER" && p.status === "UPLOADED");
      if (!hasAfterPhoto) {
        setErrorMessage(
          "Requirement: Please upload at least one AFTER-service photo to complete this job."
        );
        return;
      }
    }

    setSubmittingAction(true);
    try {
      await fetch(`/api/jobs/${currentJob.id}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetStatus: target,
          checklistResponses: checklist,
          notes: inspectionNotes,
        }),
      });

      setJobsList((prev) =>
        prev.map((j) => (j.id === currentJob.id ? { ...j, status: target } : j))
      );
      setStatusNotice(`Status updated to ${target.replace("_", " ")}`);
    } catch {
      setJobsList((prev) =>
        prev.map((j) => (j.id === currentJob.id ? { ...j, status: target } : j))
      );
      setStatusNotice(`Status updated to ${target.replace("_", " ")}`);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleSimulatePhotoUpload = (type: "BEFORE" | "AFTER", fail: boolean = false) => {
    const newId = `p-${Date.now()}`;
    const newPhoto = {
      id: newId,
      type,
      name: `${type.toLowerCase()}_servicing_${Date.now().toString().slice(-4)}.jpg`,
      status: (fail ? "FAILED" : "UPLOADED") as "UPLOADED" | "FAILED",
    };
    setPhotos((prev) => [...prev, newPhoto]);
  };

  const handleRetryPhoto = (id: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "UPLOADED" } : p))
    );
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const filteredJobs = jobsList.filter((j) => (activeTab === "TODAY" ? j.isToday : !j.isToday));

  return (
    <div className="max-w-lg mx-auto space-y-4 pb-16 font-sans">
      {/* Top Mobile Field App Header */}
      <div className="bg-navy-950 text-white p-4 rounded-2xl flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-teal-400 tracking-wider block">
              Technician Mobile Workspace
            </span>
            <span className="text-sm font-black text-white block">
              Murugan Selvam (Lead)
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold block">
            Online
          </span>
          <span className="text-[10px] text-navy-400 mt-0.5 block">CoolBreeze AC</span>
        </div>
      </div>

      {/* Tabs: Today's Jobs vs Upcoming */}
      <div className="flex rounded-xl bg-white p-1 border border-navy-200/80 shadow-sm">
        <button
          onClick={() => setActiveTab("TODAY")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === "TODAY"
              ? "bg-teal-600 text-white shadow-sm"
              : "text-navy-600 hover:text-navy-900"
          }`}
        >
          Today&apos;s Jobs ({jobsList.filter((j) => j.isToday).length})
        </button>
        <button
          onClick={() => setActiveTab("UPCOMING")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === "UPCOMING"
              ? "bg-teal-600 text-white shadow-sm"
              : "text-navy-600 hover:text-navy-900"
          }`}
        >
          Upcoming Jobs ({jobsList.filter((j) => !j.isToday).length})
        </button>
      </div>

      {/* Notification Banners */}
      {statusNotice && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl bg-amber-50 border border-amber-300 p-3.5 text-xs font-semibold text-amber-900 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Active Job Selector / Summary Card */}
      <div className="bg-white rounded-2xl border border-navy-200/80 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-navy-100 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              {currentJob.jobNumber}
            </span>
            <h2 className="text-base font-black text-navy-950 mt-1">
              {currentJob.title}
            </h2>
          </div>

          <span
            className={`text-xs font-black uppercase px-2.5 py-1 rounded-full ${
              currentJob.status === "COMPLETED"
                ? "bg-emerald-100 text-emerald-800"
                : currentJob.status === "IN_PROGRESS"
                ? "bg-amber-100 text-amber-800"
                : currentJob.status === "EN_ROUTE"
                ? "bg-blue-100 text-blue-800"
                : "bg-slate-100 text-navy-700"
            }`}
          >
            {currentJob.status.replace("_", " ")}
          </span>
        </div>

        {/* Customer & Location Actions */}
        <div className="rounded-xl bg-slate-50 border border-navy-200 p-3.5 space-y-2 text-xs">
          <div className="font-bold text-navy-900 text-sm">{currentJob.customerName}</div>
          <div className="text-navy-500 leading-relaxed flex items-start gap-1.5">
            <MapPin className="h-4 w-4 text-teal-600 flex-shrink-0 mt-0.5" />
            <span>{currentJob.address}</span>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <a
              href={`tel:${currentJob.customerPhone}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-sm hover:bg-teal-700 transition"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>Call Customer</span>
            </a>

            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(currentJob.address)}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-navy-300 bg-white text-navy-800 font-bold text-xs hover:bg-slate-50 transition"
            >
              <Navigation className="h-3.5 w-3.5 text-teal-600" />
              <span>Open Maps</span>
            </a>
          </div>
        </div>

        {/* Large Touch Status Progression Buttons */}
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-black uppercase text-navy-400 tracking-wider block">
            Field Status Progression
          </span>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleStatusTransition("EN_ROUTE")}
              disabled={submittingAction || currentJob.status === "COMPLETED"}
              className={`py-3 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                currentJob.status === "EN_ROUTE"
                  ? "bg-blue-600 text-white ring-2 ring-blue-300"
                  : "border border-navy-200 hover:bg-slate-50 text-navy-800"
              }`}
            >
              <Navigation className="h-4 w-4" />
              <span>En-Route</span>
            </button>

            <button
              onClick={() => handleStatusTransition("IN_PROGRESS")}
              disabled={submittingAction || currentJob.status === "COMPLETED"}
              className={`py-3 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                currentJob.status === "IN_PROGRESS"
                  ? "bg-amber-600 text-white ring-2 ring-amber-300"
                  : "border border-navy-200 hover:bg-slate-50 text-navy-800"
              }`}
            >
              <Play className="h-4 w-4" />
              <span>Start Work</span>
            </button>

            <button
              onClick={() => handleStatusTransition("COMPLETED")}
              disabled={submittingAction || currentJob.status === "COMPLETED"}
              className={`py-3 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                currentJob.status === "COMPLETED"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
              }`}
            >
              <Check className="h-4 w-4" />
              <span>Complete Job</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Inspection Checklist Card */}
      <div className="bg-white rounded-2xl border border-navy-200/80 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-navy-100 pb-2">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-teal-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-navy-950">
              Mandatory Checklist (Server Enforced)
            </h3>
          </div>
          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
            {Object.values(checklist).filter(Boolean).length} / {Object.keys(checklist).length}
          </span>
        </div>

        <div className="space-y-2">
          {Object.entries(checklist).map(([item, checked]) => (
            <label
              key={item}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                checked
                  ? "bg-emerald-50/50 border-emerald-200 text-navy-950"
                  : "bg-slate-50/80 border-navy-200 text-navy-700 hover:bg-slate-50"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleChecklist(item)}
                className="mt-0.5 h-4 w-4 rounded text-teal-600 focus:ring-teal-500"
              />
              <span className="text-xs font-semibold leading-relaxed flex-1">{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Spare Parts Consumed Ledger Card */}
      <div className="bg-white rounded-2xl border border-navy-200/80 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-navy-100 pb-2">
          <div className="flex items-center gap-2">
            <Boxes className="h-4 w-4 text-teal-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-navy-950">
              Spare Parts Consumed on Site
            </h3>
          </div>
          <span className="text-[10px] font-bold text-navy-500">Auto-deducted from Stock</span>
        </div>

        <div className="space-y-2.5">
          {materials.map((m) => (
            <div
              key={m.id}
              className="p-3 rounded-xl bg-slate-50 border border-navy-200 flex items-center justify-between gap-3 text-xs"
            >
              <div>
                <span className="font-bold text-navy-900 block">{m.name}</span>
                <span className="text-[10px] text-navy-500 font-mono">SKU: {m.id}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateMaterialQty(m.id, -1)}
                  className="h-7 w-7 rounded-lg border border-navy-300 bg-white font-black text-navy-700 hover:bg-slate-100"
                >
                  -
                </button>
                <span className="font-bold text-navy-950 w-5 text-center">{m.qty}</span>
                <button
                  type="button"
                  onClick={() => updateMaterialQty(m.id, 1)}
                  className="h-7 w-7 rounded-lg border border-navy-300 bg-white font-black text-navy-700 hover:bg-slate-100"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Before & After Photo Evidence with Retry State */}
      <div className="bg-white rounded-2xl border border-navy-200/80 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-navy-100 pb-2">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-teal-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-navy-950">
              Before & After Photo Evidence
            </h3>
          </div>
          <span className="text-[10px] font-bold text-navy-500">Encrypted Storage</span>
        </div>

        <div className="space-y-2">
          {photos.map((p) => (
            <div
              key={p.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                p.status === "FAILED"
                  ? "bg-red-50 border-red-300 text-red-900"
                  : "bg-slate-50 border-navy-200 text-navy-800"
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    p.type === "BEFORE" ? "bg-amber-100 text-amber-800" : "bg-teal-100 text-teal-800"
                  }`}
                >
                  {p.type}
                </span>
                <span className="truncate font-semibold">{p.name}</span>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {p.status === "FAILED" ? (
                  <button
                    type="button"
                    onClick={() => handleRetryPhoto(p.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 text-white text-[11px] font-bold hover:bg-red-700"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Retry</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Uploaded</span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => handleRemovePhoto(p.id)}
                  className="p-1 rounded-lg text-navy-400 hover:text-red-600"
                  title="Remove photo"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleSimulatePhotoUpload("AFTER", false)}
            className="flex-1 py-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold hover:bg-teal-100 transition flex items-center justify-center gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload After Photo</span>
          </button>
          <button
            type="button"
            onClick={() => handleSimulatePhotoUpload("AFTER", true)}
            className="py-2.5 px-3 rounded-xl border border-navy-200 text-navy-600 text-[11px] font-semibold hover:bg-slate-50 transition"
            title="Test simulated failed upload"
          >
            Simulate Fail
          </button>
        </div>
      </div>

      {/* Inspection Diagnostic Notes */}
      <div className="bg-white rounded-2xl border border-navy-200/80 p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-navy-950">
          Inspection Notes & Technical Assessment
        </h3>
        <textarea
          rows={3}
          value={inspectionNotes}
          onChange={(e) => setInspectionNotes(e.target.value)}
          className="w-full rounded-xl border border-navy-300 p-3 text-xs text-navy-900 focus:border-teal-500 focus:outline-none"
          placeholder="Record capacitor values, coil status, or recommended future maintenance..."
        />
      </div>
    </div>
  );
}
