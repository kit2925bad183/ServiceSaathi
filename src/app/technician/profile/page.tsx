"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Building2,
  ShieldCheck,
  Phone,
  Mail,
  Wrench,
  LogOut,
  MapPin,
} from "lucide-react";

export default function TechnicianProfilePage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-navy-200/80 p-5 shadow-sm text-center space-y-3">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 border border-teal-200 text-teal-700">
          <User className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-lg font-black text-navy-950">Murugan Selvam</h1>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 mt-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            Field Technician
          </span>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white rounded-2xl border border-navy-200/80 p-4 shadow-sm space-y-3 text-xs text-navy-700">
        <h2 className="text-xs font-bold text-navy-950 uppercase tracking-wider">
          Workspace Information
        </h2>

        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-navy-100">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-teal-600" />
              <span className="font-semibold text-navy-900">Assigned Business</span>
            </div>
            <span className="font-bold text-navy-950">CoolBreeze Climate Solutions</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-navy-100">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-teal-600" />
              <span className="font-semibold text-navy-900">Branch Location</span>
            </div>
            <span className="text-navy-700">T. Nagar, Chennai</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-navy-100">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-teal-600" />
              <span className="font-semibold text-navy-900">Phone</span>
            </div>
            <span className="font-mono text-navy-700">+91 98400 33445</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-navy-100">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-teal-600" />
              <span className="font-semibold text-navy-900">Email</span>
            </div>
            <span className="text-navy-700 font-mono">murugan@coolbreeze.in</span>
          </div>
        </div>
      </div>

      {/* Skills Card */}
      <div className="bg-white rounded-2xl border border-navy-200/80 p-4 shadow-sm space-y-3 text-xs">
        <h2 className="text-xs font-bold text-navy-950 uppercase tracking-wider">
          Certified Trade Categories
        </h2>
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-bold text-[11px]">
            ❄️ Split AC Jet Foam Cleaning
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-bold text-[11px]">
            ⚡ Capacitor & PCB Replacement
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-bold text-[11px]">
            🔧 Refrigerant Pressure Leak Test
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-bold text-[11px]">
            🛠️ 1.5 - 2 Ton Standard Installation
          </span>
        </div>
      </div>

      {/* Logout Action */}
      <button
        onClick={handleLogout}
        className="w-full py-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition flex items-center justify-center gap-2"
      >
        <LogOut className="h-4 w-4" />
        <span>Sign Out of Mobile App</span>
      </button>
    </div>
  );
}
