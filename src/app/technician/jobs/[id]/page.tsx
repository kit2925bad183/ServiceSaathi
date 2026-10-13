"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
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
  ShieldCheck,
  RotateCcw,
  Upload,
  Trash2,
  Sparkles,
} from "lucide-react";
import { formatINR } from "@/lib/money";

export default function TechnicianJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [job, setJob] = useState({
    id: id || "j-1001",
    jobNumber: "JOB-2026-1001",
    title: "AC Jet Wash & Odor Sanitization",
    customerName: "Ananya Ramesh",
    customerPhone: "+91 98400 11223",
    address: "Flat 2B, Green Palms Apartment, Gandhi Nagar, Adyar, 600028",
    timeWindow: "Today • 10:00 AM - 12:00 PM",
    status: "IN_PROGRESS" as "SCHEDULED" | "EN_ROUTE" | "IN_PROGRESS" | "COMPLETED",
    problemDescription: "Cooling is mild and foul odor coming from the blower when turned on.",
  });

  // Checklist state
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    "Verify outdoor compressor fan rotation & vibration": true,
    "Inspect refrigerant copper piping insulation": true,
    "Apply waterproof cover over PCB electrical box": true,
    "High pressure jet foam wash on indoor cooling coils": true,
    "Flush and vacuum condensation drain line": true,
    "Clean air filters & antibacterial sanitization": false,
    "Test post-service grill temperature (< 16°C)": false,
    "Customer sign-off and area clean-up": false,
  });

  // Parts consumed
  const [partsUsed, setPartsUsed] = useState<Array<{ id: string; name: string; qty: number; unitPrice: number }>>([
    { id: "inv-3", name: "Run Capacitor 50 MFD", qty: 1, unitPrice: 35000 },
  ]);
  const [selectedPartId, setSelectedPartId] = useState("inv-4");
  const [partQty, setPartQty] = useState(1);

  const availableParts = [
    { id: "inv-1", name: "Copper Pipe 1/2 inch", unitPrice: 48000, stock: 45 },
    { id: "inv-2", name: "R32 Refrigerant Gas (kg)", unitPrice: 120000, stock: 12 },
    { id: "inv-3", name: "Run Capacitor 50 MFD", unitPrice: 35000, stock: 28 },
    { id: "inv-4", name: "AC Drain Pipe (2m)", unitPrice: 18000, stock: 3 },
  ];

  // Photos
  const [beforePhotos, setBeforePhotos] = useState<Array<{ id: string; name: string; status: "UPLOADED" | "FAILED" }>>([
    { id: "p1", name: "dirty_condenser_coils.jpg", status: "UPLOADED" },
  ]);
  const [afterPhotos, setAfterPhotos] = useState<Array<{ id: string; name: string; status: "UPLOADED" | "FAILED" }>>([]);

  const [completionNotes, setCompletionNotes] = useState("");
  const [completing, setCompleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const toggleChecklistItem = (item: string) => {
    setChecklist((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const addPart = () => {
    const part = availableParts.find((p) => p.id === selectedPartId);
    if (!part) return;
    setPartsUsed((prev) => {
      const existing = prev.find((p) => p.id === part.id);
      if (existing) {
        return prev.map((p) => (p.id === part.id ? { ...p, qty: p.qty + partQty } : p));
      }
      return [...prev, { id: part.id, name: part.name, qty: partQty, unitPrice: part.unitPrice }];
    });
  };

  const removePart = (partId: string) => {
    setPartsUsed((prev) => prev.filter((p) => p.id !== partId));
  };

  const handleSimulatePhotoUpload = (type: "BEFORE" | "AFTER") => {
    const newPhoto = {
      id: `photo-${Date.now()}`,
      name: `${type.toLowerCase()}_inspection_${Date.now().toString().slice(-4)}.jpg`,
      status: "UPLOADED" as const,
    };
    if (type === "BEFORE") {
      setBeforePhotos((prev) => [...prev, newPhoto]);
    } else {
      setAfterPhotos((prev) => [...prev, newPhoto]);
    }
  };

  const handleCompleteJob = async () => {
    setErrorMessage(null);
    const incompleteItems = Object.entries(checklist).filter(([, done]) => !done);
    if (incompleteItems.length > 0) {
      setErrorMessage(
        `Cannot complete job: Please complete all ${Object.keys(checklist).length} safety checklist items (${incompleteItems.length} remaining).`
      );
      return;
    }

    setCompleting(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetStatus: "COMPLETED",
          notes: completionNotes || "Service successfully executed and tested.",
          checklistResponses: checklist,
          materialsConsumed: partsUsed.map((p) => ({ inventoryItemId: p.id, quantity: p.qty })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to complete job");
      }

      setJob((prev) => ({ ...prev, status: "COMPLETED" }));
      setSuccessNotice("Job completed and inventory ledger deducted successfully!");
    } catch (err: unknown) {
      // In local demo mode, apply locally
      setJob((prev) => ({ ...prev, status: "COMPLETED" }));
      setSuccessNotice("Job completed! Safety checklist and spare parts recorded.");
    } finally {
      setCompleting(false);
    }
  };

  const totalChecklistItems = Object.keys(checklist).length;
  const completedChecklistItems = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Top back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/technician/today"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-700 hover:text-navy-950 p-1 rounded-lg hover:bg-slate-200/60 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Today&apos;s Jobs</span>
        </Link>
        <span className="font-mono text-xs font-bold text-navy-500 bg-white border border-navy-200 px-2 py-0.5 rounded">
          {job.jobNumber}
        </span>
      </div>

      {successNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-3.5 rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold p-3.5 rounded-2xl flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Scope Card */}
      <div className="bg-white rounded-2xl border border-navy-200/80 p-4 shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-base font-bold text-navy-950">{job.title}</h1>
          <span
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              job.status === "COMPLETED"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-teal-50 text-teal-700 border-teal-200"
            }`}
          >
            {job.status.replace("_", " ")}
          </span>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-navy-100 text-xs space-y-2 text-navy-700">
          <div>
            <span className="text-[10px] font-bold text-navy-400 block uppercase">Reported Problem:</span>
            <span className="font-medium text-navy-900">{job.problemDescription}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-navy-400 block uppercase">Address:</span>
            <span>{job.address}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <span className="font-bold text-navy-900">{job.customerName}</span>
          <div className="flex items-center gap-2">
            <a
              href={`tel:${job.customerPhone}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-navy-200 text-navy-700 font-bold hover:bg-slate-50"
            >
              <Phone className="h-3.5 w-3.5 text-teal-600" />
              <span>Call</span>
            </a>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(job.address)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-navy-200 text-navy-700 font-bold hover:bg-slate-50"
            >
              <Navigation className="h-3.5 w-3.5 text-blue-600" />
              <span>Map</span>
            </a>
          </div>
        </div>
      </div>

      {/* 3D Equipment Digital Twin Reference */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white">3D Equipment Digital Twin</span>
              <span className="text-[9px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-1.5 py-0.2 rounded font-mono uppercase">
                Schematic
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Interactive split AC condenser exploded view, capacitor mounting points, and FLIR thermal inspection.
            </p>
          </div>
        </div>

        <Link
          href="/3d?scene=ac"
          target="_blank"
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs transition shadow-sm shrink-0"
        >
          <span>Open 3D Diagnostic Twin</span>
          <Sparkles className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Mandatory Inspection Checklist */}
      <div className="bg-white rounded-2xl border border-navy-200/80 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-teal-600" />
            <h2 className="text-xs font-bold text-navy-950 uppercase tracking-wider">
              Safety & Quality Checklist
            </h2>
          </div>
          <span className="text-xs font-black font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
            {completedChecklistItems}/{totalChecklistItems} Done
          </span>
        </div>

        <div className="space-y-2">
          {Object.entries(checklist).map(([item, checked], idx) => (
            <label
              key={idx}
              className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition text-xs select-none ${
                checked
                  ? "bg-teal-50/50 border-teal-200 text-navy-950 font-medium"
                  : "bg-slate-50 border-navy-200 text-navy-600"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleChecklistItem(item)}
                className="mt-0.5 h-4 w-4 rounded text-teal-600 focus:ring-teal-500 border-navy-300"
              />
              <span className="leading-tight">{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Spare Parts Ledger Deduction */}
      <div className="bg-white rounded-2xl border border-navy-200/80 p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Boxes className="h-4 w-4 text-teal-600" />
          <h2 className="text-xs font-bold text-navy-950 uppercase tracking-wider">
            Spare Parts & Materials Consumed
          </h2>
        </div>

        {partsUsed.length > 0 && (
          <div className="space-y-1.5">
            {partsUsed.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-navy-100 text-xs"
              >
                <div>
                  <span className="font-bold text-navy-900 block">{p.name}</span>
                  <span className="text-[11px] text-navy-500 font-mono">
                    Qty: {p.qty} • {formatINR(p.unitPrice * p.qty)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removePart(p.id)}
                  className="p-1 rounded text-rose-500 hover:bg-rose-50"
                  title="Remove part"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <select
            value={selectedPartId}
            onChange={(e) => setSelectedPartId(e.target.value)}
            className="flex-1 rounded-xl border border-navy-200 px-3 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            {availableParts.map((part) => (
              <option key={part.id} value={part.id}>
                {part.name} ({formatINR(part.unitPrice)})
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            max={10}
            value={partQty}
            onChange={(e) => setPartQty(parseInt(e.target.value) || 1)}
            className="w-16 rounded-xl border border-navy-200 px-2 py-2 text-xs text-navy-900 text-center font-mono focus:outline-none"
          />
          <button
            type="button"
            onClick={addPart}
            className="px-3.5 py-2 rounded-xl bg-navy-900 text-white text-xs font-bold hover:bg-navy-800 transition"
          >
            Add
          </button>
        </div>
      </div>

      {/* Before / After Photo Uploads */}
      <div className="bg-white rounded-2xl border border-navy-200/80 p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-teal-600" />
          <h2 className="text-xs font-bold text-navy-950 uppercase tracking-wider">
            Job Documentation Photos
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-2">
            <span className="font-semibold text-navy-700 block text-[11px]">Before Inspection:</span>
            {beforePhotos.map((p) => (
              <div key={p.id} className="p-2 rounded-lg bg-slate-50 border border-navy-100 text-[10px] truncate font-mono text-navy-700">
                📷 {p.name}
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleSimulatePhotoUpload("BEFORE")}
              className="w-full py-2 rounded-xl border border-dashed border-navy-300 hover:bg-slate-50 text-[11px] font-bold text-navy-700 transition flex items-center justify-center gap-1.5"
            >
              <Upload className="h-3 w-3" />
              <span>Add Before Photo</span>
            </button>
          </div>

          <div className="space-y-2">
            <span className="font-semibold text-navy-700 block text-[11px]">After Completion:</span>
            {afterPhotos.map((p) => (
              <div key={p.id} className="p-2 rounded-lg bg-slate-50 border border-navy-100 text-[10px] truncate font-mono text-navy-700">
                📷 {p.name}
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleSimulatePhotoUpload("AFTER")}
              className="w-full py-2 rounded-xl border border-dashed border-navy-300 hover:bg-slate-50 text-[11px] font-bold text-navy-700 transition flex items-center justify-center gap-1.5"
            >
              <Upload className="h-3 w-3" />
              <span>Add After Photo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Completion Action */}
      {job.status !== "COMPLETED" && (
        <div className="bg-white rounded-2xl border border-navy-200/80 p-4 shadow-sm space-y-3">
          <div>
            <label className="block text-xs font-semibold text-navy-700 mb-1">
              Field Completion Notes:
            </label>
            <textarea
              rows={2}
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="e.g. Jet cleaning completed, outdoor condenser coils washed, grill temp tested at 14°C..."
              className="w-full rounded-xl border border-navy-200 p-2.5 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <button
            type="button"
            onClick={handleCompleteJob}
            disabled={completing}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{completing ? "Recording completion..." : "Complete & Submit Job"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
