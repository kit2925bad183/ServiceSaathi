"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ConnectivityIndicator } from "@/components/ui/ConnectivityIndicator";
import {
  Wrench,
  CalendarDays,
  Smartphone,
  FileCheck2,
  Receipt,
  CreditCard,
  HeartHandshake,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function HowItWorksPage() {
  const { t, locale } = useTranslation();

  const workflowSteps = [
    {
      step: "01",
      title: "Customer Requests Booking",
      taTitle: "வாடிக்கையாளர் முன்பதிவு",
      role: "Customer via Branded Link",
      desc: "Customer visits your dedicated public booking link (e.g. servicesaathi.in/b/coolbreeze), chooses service, enters postal code, uploads photos, and selects a preferred time slot.",
      icon: CalendarDays,
      details: [
        "Instant postal PIN code coverage validation",
        "Clear distinction between fixed fees and diagnostic inspection charges",
        "Anti-duplicate submission protection & secure reference generated",
        "Explicit notice: Appointment is unconfirmed until dispatcher reviews",
      ],
    },
    {
      step: "02",
      title: "Triage & Conflict-Free Dispatch",
      taTitle: "பணி உறுதிப்படுத்தல் & ஒதுக்கீடு",
      role: "Operations Dispatcher",
      desc: "The dispatcher verifies technician availability on the timeline calendar. The system enforces concurrency locks to strictly prevent overlapping shift double-bookings.",
      icon: ShieldCheck,
      details: [
        "Unassigned jobs queue with postal area sorting",
        "Server-side 409 Conflict rejection if worker is already booked",
        "Worker travel buffers and time-off tracking",
        "Transactional SMS/WhatsApp assignment notification to technician",
      ],
    },
    {
      step: "03",
      title: "Mobile Field Execution",
      taTitle: "களப் பணி & சரிபார்ப்பு பட்டியல்",
      role: "Field Technician",
      desc: "Technician opens their mobile workspace to view today's jobs, updates status to En-Route and In-Progress, completes required safety checklists, and logs consumed spare parts.",
      icon: Smartphone,
      details: [
        "Large high-contrast touch targets for outdoor use",
        "Mandatory checklist verification before job completion",
        "Real-time spare parts deduction preventing negative stock",
        "Before and after photo documentation with upload retry handling",
      ],
    },
    {
      step: "04",
      title: "Quotation & Digital Approval",
      taTitle: "விலை மதிப்பீடு & வாடிக்கையாளர் ஒப்புதல்",
      role: "Technician & Customer",
      desc: "If additional repairs or components are discovered during inspection, a versioned quotation is generated. The customer receives an expiring link to review and approve digitally.",
      icon: FileCheck2,
      details: [
        "Labor and materials itemized with GST tax calculations",
        "Secure random 64-char approval token with 7-day validity",
        "Price or scope modifications automatically supersede older versions",
        "Audit timestamp and IP evidence recorded upon approval",
      ],
    },
    {
      step: "05",
      title: "Immutable Invoicing & Payment",
      taTitle: "ஜிஎஸ்டி பில் & கட்டண வசூல்",
      role: "Business Owner / Technician",
      desc: "Upon completion, an immutable GST tax invoice is issued. The customer can pay via Cash on site, Dynamic UPI QR, or Card, with partial payments audited until balance is zero.",
      icon: Receipt,
      details: [
        "Business-scoped sequential invoice numbering (e.g. INV-2026-1001)",
        "Audit trail for manual payment recordings with transaction references",
        "Automated PDF generation and WhatsApp delivery",
        "Real-time balance tracking for multi-installment payments",
      ],
    },
    {
      step: "06",
      title: "Warranty & Customer Portal",
      taTitle: "உத்தரவாதம் & வாடிக்கையாளர் சேவை",
      role: "Customer & Support Team",
      desc: "Customers access their private self-service portal to review service history, download GST invoices, submit feedback ratings, or register warranty follow-ups.",
      icon: HeartHandshake,
      details: [
        "Secure phone-verified customer job timeline",
        "Feedback rating verified against completed job status",
        "Warranty complaint registration with resolution tracking",
        "Complete separation of internal notes from customer updates",
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
              <Link href="/features" className="hover:text-navy-950 transition">
                {locale === "ta" ? "அம்சங்கள்" : "Features"}
              </Link>
              <Link href="/services" className="hover:text-navy-950 transition">
                {locale === "ta" ? "சேவைகள்" : "Services"}
              </Link>
              <Link href="/how-it-works" className="text-teal-700 font-bold">
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
            <span>End-to-End Service Lifecycle</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-navy-950 tracking-tight">
            How ServiceSaathi runs your service business
          </h1>
          <p className="mx-auto max-w-2xl text-sm sm:text-base text-navy-600 leading-relaxed">
            From the minute a customer requests a repair to the moment money hits your bank account, every handoff is audited and organized.
          </p>
        </div>
      </section>

      {/* Workflow Steps */}
      <section className="py-16 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="space-y-12">
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="flex flex-col md:flex-row gap-6 bg-white rounded-2xl border border-navy-200/80 p-6 sm:p-8 shadow-sm hover:shadow-md transition"
              >
                <div className="flex-shrink-0 flex items-center md:flex-col justify-between md:justify-start gap-4">
                  <span className="text-2xl sm:text-3xl font-black text-teal-600 font-mono">
                    {step.step}
                  </span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 border border-teal-200">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                      {step.role}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-navy-950 mt-2">
                      {locale === "ta" ? step.taTitle : step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-navy-600 mt-1 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-navy-100 space-y-2">
                    {step.details.map((detail, dIdx) => (
                      <div key={dIdx} className="flex items-start gap-2 text-xs text-navy-700">
                        <CheckCircle2 className="h-4 w-4 text-teal-600 flex-shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
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
            See the workflow in action with your own team
          </h2>
          <p className="text-sm text-navy-300 max-w-xl mx-auto">
            Try ServiceSaathi with our pre-populated Chennai & Coimbatore demo data.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-navy-950 font-bold text-xs shadow-md transition"
            >
              Sign In to Demo Workspace
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
