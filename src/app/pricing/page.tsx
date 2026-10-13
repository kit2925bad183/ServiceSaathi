"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ConnectivityIndicator } from "@/components/ui/ConnectivityIndicator";
import {
  Wrench,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";

export default function PricingPage() {
  const { t, locale } = useTranslation();
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");

  const plans = [
    {
      name: "Starter",
      taName: "தொடக்க நிலை",
      priceMonthly: 1499,
      priceAnnual: 1199,
      description: "Ideal for independent trade specialists and small local service teams.",
      target: "Up to 3 technicians",
      features: [
        "1 Business Workspace & Branded Booking Link",
        "Up to 3 Field Technicians / Dispatchers",
        "Timeline Dispatch Calendar & Conflict Locking",
        "Mobile Technician App with Checklists",
        "Unlimited Bookings & Quotations",
        "Standard GST Invoice Generation",
        "Community Support & Daily Data Backups",
      ],
      highlighted: false,
    },
    {
      name: "Growth",
      taName: "வளர்ச்சி திட்டம்",
      priceMonthly: 3999,
      priceAnnual: 3199,
      description: "The complete operating OS for growing service companies across India.",
      target: "Up to 15 technicians",
      features: [
        "Everything in Starter, plus:",
        "Up to 15 Field Technicians & Dispatchers",
        "Warehouse Parts Inventory & Stock Deductions",
        "Multi-Branch Business Workspace Switching",
        "Customer Self-Service & Warranty Portal",
        "Formula-Injection Safe CSV Analytics Exports",
        "Transactional SMS & WhatsApp Integration",
        "Bi-lingual English & Tamil Interface",
      ],
      highlighted: true,
      badge: "Most Popular",
    },
    {
      name: "Enterprise",
      taName: "நிறுவன திட்டம்",
      priceMonthly: 8999,
      priceAnnual: 7199,
      description: "Custom capabilities and dedicated SLA support for multi-city operations.",
      target: "Unlimited technicians & branches",
      features: [
        "Everything in Growth, plus:",
        "Unlimited Technicians & Office Staff",
        "Unlimited Branches Across Multiple Cities",
        "Custom ERP / Tally Accounting Export Sync",
        "Dedicated Account Specialist & Priority WhatsApp SLA",
        "Custom Checklist Templates & Safety Auditing",
        "Custom Domain & White-Label Portal",
      ],
      highlighted: false,
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
              <Link href="/features" className="hover:text-navy-950 transition">
                {locale === "ta" ? "அம்சங்கள்" : "Features"}
              </Link>
              <Link href="/services" className="hover:text-navy-950 transition">
                {locale === "ta" ? "சேவைகள்" : "Services"}
              </Link>
              <Link href="/how-it-works" className="hover:text-navy-950 transition">
                {locale === "ta" ? "செயல்முறை" : "How It Works"}
              </Link>
              <Link href="/pricing" className="text-teal-700 font-bold">
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
            <span>Transparent Pricing for Indian Businesses</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-navy-950 tracking-tight">
            Predictable plans. No hidden commissions.
          </h1>
          <p className="mx-auto max-w-2xl text-sm sm:text-base text-navy-600 leading-relaxed">
            ServiceSaathi is your private workspace. We do not take cuts or percentages from your customer invoices or service transactions.
          </p>

          {/* Billing Switch */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span
              className={`text-xs font-bold ${
                billingCycle === "MONTHLY" ? "text-navy-950" : "text-navy-400"
              }`}
            >
              Monthly Billing
            </span>
            <button
              onClick={() =>
                setBillingCycle((prev) => (prev === "MONTHLY" ? "ANNUAL" : "MONTHLY"))
              }
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-teal-600 transition focus:outline-none"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  billingCycle === "ANNUAL" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-xs font-bold flex items-center gap-1.5 ${
                billingCycle === "ANNUAL" ? "text-navy-950" : "text-navy-400"
              }`}
            >
              Annual Billing
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                Save 20%
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((p, idx) => {
            const price = billingCycle === "ANNUAL" ? p.priceAnnual : p.priceMonthly;
            return (
              <div
                key={idx}
                className={`bg-white rounded-3xl p-8 flex flex-col justify-between transition relative ${
                  p.highlighted
                    ? "border-2 border-teal-600 shadow-xl shadow-teal-600/10"
                    : "border border-navy-200/80 shadow-sm hover:shadow-md"
                }`}
              >
                {p.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
                    {p.badge}
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-navy-950">
                      {locale === "ta" ? p.taName : p.name}
                    </h3>
                    <p className="text-xs text-navy-500 mt-1">{p.description}</p>
                    <div className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg mt-2 inline-block">
                      {p.target}
                    </div>
                  </div>

                  <div className="border-t border-b border-navy-100 py-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-navy-950">
                        ₹{price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-navy-500 font-semibold">/ month</span>
                    </div>
                    <span className="text-[11px] text-navy-400 block mt-1">
                      + 18% GST • Billed {billingCycle === "ANNUAL" ? "annually" : "monthly"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <span className="text-xs font-bold text-navy-900 block uppercase tracking-wider">
                      Included In Plan:
                    </span>
                    <ul className="space-y-2 text-xs text-navy-700">
                      {p.features.map((f, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-teal-600 flex-shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-8 mt-6 border-t border-navy-100">
                  <Link
                    href="/register"
                    className={`w-full py-3 rounded-xl text-xs font-bold text-center block transition shadow-sm ${
                      p.highlighted
                        ? "bg-teal-600 hover:bg-teal-700 text-white"
                        : "bg-slate-100 hover:bg-slate-200 text-navy-900"
                    }`}
                  >
                    Start 14-Day Free Trial
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Transparent Inclusions Callout */}
      <section className="bg-slate-50 border-t border-navy-100 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-navy-950 font-bold text-base">
            <ShieldCheck className="h-5 w-5 text-teal-600" />
            <span>Guaranteed Service Invariants</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-navy-600">
            <div className="bg-white p-4 rounded-xl border border-navy-200/80">
              <strong className="text-navy-900 block mb-1">Zero Commission Take-Rate:</strong>
              You keep 100% of customer collections. Payments flow directly to your designated bank account or UPI VPA.
            </div>
            <div className="bg-white p-4 rounded-xl border border-navy-200/80">
              <strong className="text-navy-900 block mb-1">Full Data Portability:</strong>
              Export customer lists, job histories, and stock ledgers anytime as formula-safe CSV files with zero vendor lock-in.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
