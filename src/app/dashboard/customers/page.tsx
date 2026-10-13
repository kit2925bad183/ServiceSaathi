"use client";

import React, { useState } from "react";
import { useTranslation } from "@/lib/i18n/context";
import {
  Users,
  Search,
  MapPin,
  Phone,
  Mail,
  Wrench,
  ShieldCheck,
  Calendar,
  Lock,
} from "lucide-react";

export default function CustomersPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const [customers] = useState([
    {
      id: "c-1",
      name: "Ananya Ramesh",
      phone: "+91 98401 23456",
      email: "ananya.ramesh@gmail.com",
      addresses: [
        {
          line1: "Flat 2B, Green Palms Apartment",
          line2: "14, 2nd Main Road, Gandhi Nagar, Adyar",
          city: "Chennai",
          pincode: "600028",
          isDefault: true,
        },
      ],
      assets: [
        {
          name: "Daikin 1.5 Ton 5-Star Inverter Split AC",
          brand: "Daikin",
          modelNumber: "FTKF50TV",
          serialNumber: "DKN2024-88910",
          warranty: "Valid until Apr 2029",
        },
      ],
      jobsCompleted: 1,
      totalSpendRupees: 1355.82,
      internalNotes: "Owner requested afternoon calls. Very satisfied with jet foam cleaning.",
    },
    {
      id: "c-2",
      name: "Senthil Nathan",
      phone: "+91 98412 88990",
      email: "senthil.nathan@yahoo.com",
      addresses: [
        {
          line1: "18, Thanikachalam Road",
          line2: "T. Nagar",
          city: "Chennai",
          pincode: "600017",
          isDefault: true,
        },
      ],
      assets: [
        {
          name: "Blue Star 1.5 Ton Split AC",
          brand: "Blue Star",
          modelNumber: "IA318YNU",
          serialNumber: "BS2025-1192",
          warranty: "Installation Warranty (90 Days)",
        },
      ],
      jobsCompleted: 0,
      totalSpendRupees: 0,
      internalNotes: "New customer booking installation.",
    },
  ]);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-navy-200/80 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-navy-950">
            {t.common.customers} & Customer Assets
          </h1>
          <p className="text-xs text-navy-500 mt-1">
            Registered customer accounts, verified service addresses, appliance serial numbers, and private internal notes.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative bg-white p-3 rounded-xl border border-navy-200/80 shadow-sm">
        <Search className="absolute left-6 top-5 h-4 w-4 text-navy-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer name, phone number, or email..."
          className="w-full rounded-lg border border-navy-300 pl-10 pr-3 py-2 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
        />
      </div>

      {/* Customers List */}
      <div className="space-y-4">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-navy-200/80 p-5 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy-100 pb-3">
              <div>
                <h2 className="text-base font-black text-navy-950">{c.name}</h2>
                <div className="flex items-center gap-3 text-xs text-navy-500 mt-0.5">
                  <a href={`tel:${c.phone}`} className="text-brand-700 font-semibold flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {c.phone}
                  </a>
                  {c.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-navy-400" />
                      {c.email}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-navy-400 block">
                  Service History
                </span>
                <span className="text-xs font-bold text-navy-900">
                  {c.jobsCompleted} Completed Jobs • ₹{c.totalSpendRupees.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Addresses and Registered Assets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-navy-50/60 p-3 rounded-xl border border-navy-100 space-y-1">
                <div className="flex items-center gap-1 font-bold text-navy-800 text-[11px]">
                  <MapPin className="h-3.5 w-3.5 text-brand-600" />
                  <span>Verified Service Address:</span>
                </div>
                {c.addresses.map((addr, idx) => (
                  <div key={idx} className="text-navy-600">
                    <p>{addr.line1}</p>
                    <p>{addr.line2}</p>
                    <p className="font-semibold text-navy-800">
                      {addr.city} - {addr.pincode}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-navy-50/60 p-3 rounded-xl border border-navy-100 space-y-1">
                <div className="flex items-center gap-1 font-bold text-navy-800 text-[11px]">
                  <Wrench className="h-3.5 w-3.5 text-brand-600" />
                  <span>Registered Appliances / Assets:</span>
                </div>
                {c.assets.map((asset, idx) => (
                  <div key={idx} className="text-navy-600">
                    <p className="font-bold text-navy-900">{asset.name}</p>
                    <p className="text-[11px] font-mono text-navy-500">
                      Model: {asset.modelNumber} | S/N: {asset.serialNumber}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-semibold">
                      {asset.warranty}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Internal Staff Notes (Permission Restricted) */}
            <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2">
              <Lock className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Private Internal Staff Notes: </strong>
                <span>{c.internalNotes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
