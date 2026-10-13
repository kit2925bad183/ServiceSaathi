"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Users,
  Briefcase,
  Receipt,
  Search,
} from "lucide-react";

interface BusinessRecord {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  _count: {
    memberships: number;
    jobs: number;
    invoices: number;
  };
}

export default function PlatformBusinessesPage() {
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/platform/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.businesses) {
          setBusinesses(data.businesses);
        } else {
          // Demo fallback
          setBusinesses([
            {
              id: "biz_coolbreeze",
              name: "CoolBreeze Climate Solutions",
              slug: "coolbreeze",
              city: "Chennai",
              state: "Tamil Nadu",
              phone: "+91 44 2812 3456",
              email: "support@coolbreeze.in",
              isVerified: true,
              createdAt: "2026-01-10",
              _count: { memberships: 3, jobs: 4, invoices: 3 },
            },
            {
              id: "biz_apexcare",
              name: "Apex Power & Appliance Care",
              slug: "apexcare",
              city: "Coimbatore",
              state: "Tamil Nadu",
              phone: "+91 422 234 5678",
              email: "contact@apexcare.in",
              isVerified: true,
              createdAt: "2026-02-15",
              _count: { memberships: 2, jobs: 1, invoices: 1 },
            },
          ]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = businesses.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.slug.toLowerCase().includes(search.toLowerCase()) ||
      b.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-navy-200/80 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-navy-950">
            Registered Service Businesses
          </h1>
          <p className="text-xs text-navy-500 mt-1">
            Platform directory of active independent trade business workspaces and onboarding status.
          </p>
        </div>
        <div className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl">
          Total Workspaces: {businesses.length}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-3 rounded-xl border border-navy-200/80 shadow-sm flex items-center gap-2">
        <Search className="h-4 w-4 text-navy-400 ml-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by business name, slug, or city..."
          className="w-full text-xs text-navy-900 focus:outline-none placeholder-navy-400"
        />
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-2xl border border-navy-200/80 p-5 shadow-sm hover:shadow-md transition space-y-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-navy-950">{b.name}</h3>
                  {b.isVerified ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Unverified
                    </span>
                  )}
                </div>
                <div className="text-xs text-navy-500 mt-0.5 font-mono">
                  Slug: /{b.slug} • {b.city}, {b.state}
                </div>
              </div>

              <Link
                href={`/b/${b.slug}`}
                target="_blank"
                className="p-2 rounded-xl text-navy-500 hover:text-navy-900 hover:bg-slate-50 transition"
                title="Open Public Booking Page"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-xs text-center border border-navy-100">
              <div>
                <span className="text-[10px] text-navy-400 block font-semibold uppercase">Staff</span>
                <span className="font-bold text-navy-900 text-sm">{b._count.memberships}</span>
              </div>
              <div>
                <span className="text-[10px] text-navy-400 block font-semibold uppercase">Jobs</span>
                <span className="font-bold text-navy-900 text-sm">{b._count.jobs}</span>
              </div>
              <div>
                <span className="text-[10px] text-navy-400 block font-semibold uppercase">Invoices</span>
                <span className="font-bold text-navy-900 text-sm">{b._count.invoices}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-navy-500 pt-1">
              <span>Contact: {b.phone}</span>
              <span>Joined: {new Date(b.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
