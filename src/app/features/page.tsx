"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ConnectivityIndicator } from "@/components/ui/ConnectivityIndicator";
import {
  Wrench,
  Calendar,
  Smartphone,
  Receipt,
  ShieldCheck,
  Zap,
  BarChart3,
  CheckCircle2,
  Clock,
  Layers,
  Users2,
  ArrowRight,
  Boxes,
  Lock,
} from "lucide-react";

export default function FeaturesPage() {
  const { t, locale } = useTranslation();

  const featurePillars = [
    {
      title: "Dispatch Calendar & Conflict Prevention",
      taTitle: "பணி ஒதுக்கீடு & கால அட்டவணை",
      desc: "Day & week timeline view with worker availability, travel buffers, and server-side concurrency locks that prevent double-booking field technicians.",
      icon: Calendar,
      tag: "Operations",
      points: [
        "Server-side 409 Conflict rejection for overlapping slots",
        "Day and week schedule triage with unassigned queues",
        "Accessible modal assignment for keyboard & screen readers",
        "Technician shift and time-off visibility",
      ],
    },
    {
      title: "Field Technician Mobile Experience",
      taTitle: "களப் பணியாளர் மொபைல் தளம்",
      desc: "Designed specifically for technicians in the field with high-contrast buttons, step-by-step checklists, spare parts consumption, and photo uploads.",
      icon: Smartphone,
      tag: "Field Operations",
      points: [
        "En-route, in-progress, and job completion transitions",
        "Mandatory checklist completion before sign-off",
        "Real-time spare parts deduction from warehouse ledger",
        "Before and after photo upload with retry states",
      ],
    },
    {
      title: "GST Invoicing & Multi-Method Partial Payments",
      taTitle: "ஜிஎஸ்டி பில் & பகுதி கட்டண வசூல்",
      desc: "Immutable issued invoices with compliant tax basis points (18%), business-scoped numbering, and audited recording of cash, UPI, and card payments.",
      icon: Receipt,
      tag: "Finance",
      points: [
        "Versioned quotations with expiring customer approval links",
        "Automatic GST calculation using integer paise minor units",
        "Partial payments ledger tracking remaining balances",
        "Audited transaction histories and refund records",
      ],
    },
    {
      title: "True Multi-Tenancy & Data Isolation",
      taTitle: "பாதுகாப்பான வணிக தனிமைப்படுத்தல்",
      desc: "Every database query, background job, and webhook is strictly bound to the authenticated business ID with cryptographically signed session tokens.",
      icon: ShieldCheck,
      tag: "Security",
      points: [
        "Multi-business switching without re-authenticating",
        "Single-use expiring staff invitation links (7-day validity)",
        "Last-active owner protection preventing account lockout",
        "CSV export formula injection sanitization",
      ],
    },
    {
      title: "Parts Inventory & Warehouse Ledger",
      taTitle: "உதிரிபாகங்கள் இருப்பு மேலாண்மை",
      desc: "Track copper pipes, capacitors, gas cylinders, and consumables with automatic low-stock warnings and deduction upon job completion.",
      icon: Boxes,
      tag: "Inventory",
      points: [
        "Transactional stock deductions preventing negative quantities",
        "SKU, category, cost price, and customer selling price",
        "Minimum threshold alerts for replenishment",
        "Complete historical audit movements ledger",
      ],
    },
    {
      title: "Transactional Outbox & Live SSE Updates",
      taTitle: "நிகழ்நேர அறிவிப்புகள் & பின்னணி பணிகள்",
      desc: "Atomic database transactions guarantee messages and notifications are never lost, powered by Server-Sent Events scoped to verified users.",
      icon: Zap,
      tag: "Architecture",
      points: [
        "Transactional Outbox pattern ensuring 100% event delivery",
        "Authenticated Server-Sent Events with automatic reconnects",
        "BullMQ retry queue with exponential backoff",
        "Zero cross-tenant data leaks over live channels",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-navy-900 font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-navy-200/80 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
                <Wrench className="h-5 w-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-navy-950">
                ServiceSaathi
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-navy-600">
              <Link href="/features" className="text-teal-700 font-bold">
                {locale === "ta" ? "அம்சங்கள்" : "Features"}
              </Link>
              <Link href="/services" className="hover:text-navy-950 transition">
                {locale === "ta" ? "சேவைகள்" : "Services"}
              </Link>
              <Link href="/how-it-works" className="hover:text-navy-950 transition">
                {locale === "ta" ? "செயல்முறை" : "How It Works"}
              </Link>
              <Link href="/pricing" className="hover:text-navy-950 transition">
                {locale === "ta" ? "கட்டணம்" : "Pricing"}
              </Link>
              <Link href="/contact" className="hover:text-navy-950 transition">
                {locale === "ta" ? "தொடர்பு" : "Contact"}
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <ConnectivityIndicator />
            <LanguageSwitcher />
            <Link
              href="/login"
              className="text-xs font-semibold text-navy-700 hover:text-navy-950 px-2.5 py-1.5 transition"
            >
              {t.common.signIn}
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition"
            >
              {locale === "ta" ? "பதிவு செய்க" : "Get Started"}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white pt-16 pb-12 border-b border-navy-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
            <span>Built for Modern Trade Services in India</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-navy-950 tracking-tight">
            Engineered for reliability, from <br className="hidden sm:block" />
            <span className="text-teal-600">dispatch to payment collection</span>
          </h1>
          <p className="mx-auto max-w-2xl text-sm sm:text-base text-navy-600 leading-relaxed">
            Every feature in ServiceSaathi was designed to solve practical friction experienced by local AC, appliance, electrical, and plumbing businesses.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featurePillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-navy-200/80 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-navy-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {p.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-navy-950">
                    {locale === "ta" ? p.taTitle : p.title}
                  </h3>
                  <p className="text-xs text-navy-600 leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-navy-100 space-y-2">
                  {p.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2 text-xs text-navy-700">
                      <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-950 text-white py-16 px-4 sm:px-6 mt-auto">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Ready to upgrade your service operations?
          </h2>
          <p className="text-sm text-navy-300 max-w-xl mx-auto">
            Get started with a 14-day free trial. Setup takes less than 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-navy-950 font-bold text-xs shadow-md transition"
            >
              Start Free Trial
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-navy-700 hover:bg-navy-900 text-white font-bold text-xs transition"
            >
              Request Live Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
