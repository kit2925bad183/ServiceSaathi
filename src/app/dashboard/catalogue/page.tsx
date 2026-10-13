"use client";

import React, { useState } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { formatINR } from "@/lib/money";
import {
  Layers,
  CheckSquare,
  Clock,
  PlusCircle,
  FileQuestion,
  Sparkles,
} from "lucide-react";

export default function ServiceCataloguePage() {
  const { t } = useTranslation();

  const [services] = useState([
    {
      id: "svc-1",
      category: "AC installation and repair",
      name: "Split AC Standard Installation (1 - 2 Ton)",
      pricingType: "FIXED",
      basePricePaise: 149900,
      duration: 120,
      version: 1,
      checklistCount: 6,
      isActive: true,
      description: "Wall bracket mounting, indoor/outdoor unit installation, and vacuuming.",
    },
    {
      id: "svc-2",
      category: "AC installation and repair",
      name: "Jet Pump Deep Cleaning & Coil Sanitization",
      pricingType: "FIXED",
      basePricePaise: 79900,
      duration: 60,
      version: 1,
      checklistCount: 8,
      isActive: true,
      description: "High-pressure foam wash of cooling coils, filter sanitization, blower wash.",
    },
    {
      id: "svc-3",
      category: "AC installation and repair",
      name: "AC Gas Leakage Diagnosis & Refill",
      pricingType: "QUOTATION",
      basePricePaise: 34900,
      duration: 90,
      version: 1,
      checklistCount: 5,
      isActive: true,
      description: "Nitrogen pressure testing, brazing leak repair, and virgin gas top-up.",
    },
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-navy-200/80 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-navy-950">
            {t.common.catalogue}
          </h1>
          <p className="text-xs text-navy-500 mt-1">
            Configure trade services, pricing models, questions, and versioned technician checklists.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {services.map((svc) => (
          <div
            key={svc.id}
            className="bg-white rounded-2xl border border-navy-200/80 p-5 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                  {svc.category}
                </span>
                <span className="text-[10px] font-bold text-navy-400 bg-navy-100 px-2 py-0.5 rounded-md">
                  v{svc.version}
                </span>
              </div>

              <h2 className="text-base font-black text-navy-950 mt-3 leading-snug">
                {svc.name}
              </h2>
              <p className="text-xs text-navy-500 mt-1 line-clamp-2">
                {svc.description}
              </p>

              <div className="mt-4 pt-3 border-t border-navy-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-navy-400 block">
                    {svc.pricingType}
                  </span>
                  <span className="text-base font-black text-navy-950">
                    {formatINR(svc.basePricePaise)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-navy-400 block">
                    Estimated Time
                  </span>
                  <span className="text-xs font-bold text-navy-700 flex items-center gap-1 justify-end">
                    <Clock className="h-3 w-3" />
                    ~{svc.duration} mins
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-navy-50/70 p-3 rounded-xl border border-navy-100 text-xs flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-navy-700 font-semibold">
                <CheckSquare className="h-3.5 w-3.5 text-brand-600" />
                <span>{svc.checklistCount} Mandatory Checklist Steps</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700">Enforced</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
