"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { formatINR } from "@/lib/money";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Search,
  Filter,
  ExternalLink,
  Briefcase,
  AlertCircle,
} from "lucide-react";

interface BookingRecord {
  id: string;
  reference: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  pincode: string;
  address: string;
  requestedDate: string;
  timeWindow: string;
  problem: string;
  status: "PENDING" | "CONFIRMED" | "DECLINED";
  source: string;
}

export default function BookingsManagementPage() {
  const { t } = useTranslation();

  const [bookings, setBookings] = useState<BookingRecord[]>([
    {
      id: "b-1",
      reference: "BK-2026-1001",
      customerName: "Ananya Ramesh",
      customerPhone: "+91 98401 23456",
      serviceName: "Jet Pump Deep Cleaning & Coil Sanitization",
      pincode: "600028",
      address: "Flat 2B, Green Palms Apartment, Gandhi Nagar, Adyar",
      requestedDate: "Today",
      timeWindow: "Morning (9:00 AM - 1:00 PM)",
      problem: "Cooling is mild and foul odor coming from the blower when turned on.",
      status: "CONFIRMED",
      source: "PUBLIC_PAGE",
    },
    {
      id: "b-2",
      reference: "BK-2026-1002",
      customerName: "Senthil Nathan",
      customerPhone: "+91 98412 88990",
      serviceName: "Split AC Standard Installation (1 - 2 Ton)",
      pincode: "600017",
      address: "18, Thanikachalam Road, T. Nagar",
      requestedDate: "Tomorrow",
      timeWindow: "Afternoon (1:00 PM - 5:00 PM)",
      problem: "New Daikin 1.5T AC delivered. Need professional wall bracket mounting & copper piping.",
      status: "PENDING",
      source: "PUBLIC_PAGE",
    },
    {
      id: "b-3",
      reference: "BK-2026-1003",
      customerName: "Kavitha Balan",
      customerPhone: "+91 94441 55667",
      serviceName: "AC Gas Leakage Diagnosis & Refill",
      pincode: "600040",
      address: "6, 2nd Avenue, Anna Nagar",
      requestedDate: "14 Oct 2026",
      timeWindow: "Morning (9:00 AM - 1:00 PM)",
      problem: "Outdoor unit compressor running continuously but no cold air blowing.",
      status: "PENDING",
      source: "PUBLIC_PAGE",
    },
  ]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [successNote, setSuccessNote] = useState<string | null>(null);

  const handleConfirm = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "CONFIRMED" } : b))
    );
    setSuccessNote(`Booking confirmed and assigned to scheduling pipeline.`);
    setTimeout(() => setSuccessNote(null), 4000);
  };

  const handleDecline = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "DECLINED" } : b))
    );
    setSuccessNote(`Booking marked as declined with recorded reason.`);
    setTimeout(() => setSuccessNote(null), 4000);
  };

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      b.reference.toLowerCase().includes(search.toLowerCase()) ||
      b.serviceName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-navy-200/80 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-navy-950">
            {t.common.bookings}
          </h1>
          <p className="text-xs text-navy-500 mt-1">
            Customer service requests submitted online or via phone dispatch.
          </p>
        </div>

        <Link
          href="/b/coolbreeze"
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-xl border border-navy-300 bg-white px-3.5 py-2 text-xs font-bold text-navy-800 shadow-sm hover:bg-navy-50 transition"
        >
          <span>Open Public Booking Page</span>
          <ExternalLink className="h-3.5 w-3.5 text-navy-500" />
        </Link>
      </div>

      {successNote && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{successNote}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-navy-200/80 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-navy-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, booking reference, or service..."
            className="w-full rounded-lg border border-navy-300 pl-9 pr-3 py-1.5 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-navy-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-navy-300 px-3 py-1.5 text-xs text-navy-800 focus:border-brand-500 focus:outline-none bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Approval</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="DECLINED">Declined</option>
          </select>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-3">
        {filtered.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-2xl border border-navy-200/80 p-5 shadow-sm hover:shadow-md transition space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold bg-navy-100 text-navy-900 px-2.5 py-0.5 rounded-md">
                  {b.reference}
                </span>
                <span className="text-sm font-black text-navy-950">
                  {b.serviceName}
                </span>
              </div>

              <span
                className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full w-fit ${
                  b.status === "CONFIRMED"
                    ? "bg-emerald-100 text-emerald-800"
                    : b.status === "DECLINED"
                    ? "bg-rose-100 text-rose-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {b.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-navy-600">
              <div>
                <span className="text-navy-400 block text-[10px] uppercase font-bold">
                  Customer
                </span>
                <span className="font-bold text-navy-950 text-sm block">
                  {b.customerName}
                </span>
                <a href={`tel:${b.customerPhone}`} className="text-brand-700 font-semibold flex items-center gap-1 mt-0.5">
                  <Phone className="h-3 w-3" />
                  {b.customerPhone}
                </a>
              </div>

              <div>
                <span className="text-navy-400 block text-[10px] uppercase font-bold">
                  Address & PIN
                </span>
                <span className="text-navy-800 block">{b.address}</span>
                <span className="text-[11px] font-semibold text-navy-500">
                  PIN: {b.pincode} (Service Area Covered)
                </span>
              </div>

              <div>
                <span className="text-navy-400 block text-[10px] uppercase font-bold">
                  Schedule Preference
                </span>
                <span className="text-navy-800 font-bold block">{b.requestedDate}</span>
                <span className="text-[11px] text-navy-500">{b.timeWindow}</span>
              </div>
            </div>

            <div className="bg-navy-50/70 p-3 rounded-xl border border-navy-100 text-xs">
              <strong className="text-navy-700">Reported Problem: </strong>
              <span className="text-navy-600">{b.problem}</span>
            </div>

            {/* Actions */}
            {b.status === "PENDING" && (
              <div className="flex gap-2 justify-end pt-1">
                <button
                  onClick={() => handleDecline(b.id)}
                  className="rounded-xl border border-navy-300 px-3 py-1.5 text-xs font-semibold text-navy-700 hover:bg-navy-50 transition"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleConfirm(b.id)}
                  className="rounded-xl bg-brand-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-brand-700 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Accept & Confirm Booking
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
