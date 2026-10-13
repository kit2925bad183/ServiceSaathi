"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ConnectivityIndicator } from "@/components/ui/ConnectivityIndicator";
import { ServiceCategoryKey } from "@/components/home/Neighborhood3DScene";
import {
  Wrench,
  CalendarCheck,
  FileCheck2,
  Receipt,
  Boxes,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Send,
  Zap,
  Building2,
  Users2,
  PhoneCall,
  Sparkles,
  Smartphone,
  ChevronDown,
  Layers,
  MapPin,
  HelpCircle,
  ExternalLink,
  Snowflake,
  Droplets,
  SunMedium,
  Camera,
  Flame,
  CloudRain,
} from "lucide-react";

// Lazy-load the Three.js 3D hero independently of essential page content
const Neighborhood3DScene = dynamic(
  () =>
    import("@/components/home/Neighborhood3DScene").then(
      (mod) => mod.Neighborhood3DScene
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[440px] rounded-2xl bg-slate-100 border border-navy-200/80 animate-pulse flex flex-col items-center justify-center p-6 text-center">
        <Wrench className="h-8 w-8 text-teal-600 mb-2 animate-bounce" />
        <span className="text-xs font-bold text-navy-700">
          Loading 3D Service Dispatch Simulation...
        </span>
      </div>
    ),
  }
);

export default function HomePage() {
  const { t, locale } = useTranslation();

  // Active 3D highlight category
  const [activeCategory, setActiveCategory] = useState<ServiceCategoryKey>("ac");

  // Contact / Demo form state
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    phone: "",
    email: "",
    serviceCategory: "AC installation and repair",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(null);
    setSubmitError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      setSubmitSuccess(data.message || "Thank you! Your request has been recorded.");
      setFormData({
        name: "",
        businessName: "",
        phone: "",
        email: "",
        serviceCategory: "AC installation and repair",
        message: "",
      });
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryDetails: Record<
    ServiceCategoryKey,
    { title: string; taTitle: string; desc: string; icon: string }
  > = {
    ac: {
      title: "HVAC & Air Conditioning",
      taTitle: "ஏசி பொருத்துதல் மற்றும் பழுதுபார்த்தல்",
      desc: "Jet spray cleaning, vacuum pressure leak testing, compressor capacitor replacement, and scheduled AMC tracking.",
      icon: "❄️",
    },
    electrical: {
      title: "Electrical Infrastructure & Rewiring",
      taTitle: "மின்சார வேலைகள் மற்றும் வயரிங்",
      desc: "Commercial distribution panels, MCB breaker upgrades, load balancing, safety earthing, and inverter backups.",
      icon: "⚡",
    },
    plumbing: {
      title: "Sanitary & Water Management",
      taTitle: "குழாய் மற்றும் பிளம்பிங் பணிகள்",
      desc: "Overhead storage tank inspection, pressure booster pumps, concealed leak detection, and sanitary fitting installations.",
      icon: "🔧",
    },
    cleaning: {
      title: "Deep Sanitization & Facility Care",
      taTitle: "வீடு & அலுவலக சுத்தம்",
      desc: "Post-renovation mechanized floor scrubbing, antibacterial upholstery treatment, water tank cleaning, and pest protection.",
      icon: "✨",
    },
  };

  const faqs = [
    {
      q: "How does ServiceSaathi isolate data between different service businesses?",
      a: "Every database query, background job, and report export is strictly scoped by verified business membership IDs. Technicians only see jobs assigned to them, and customers never see other accounts or internal notes.",
    },
    {
      q: "Does customer appointment booking automatically reserve technician slots?",
      a: "No. Preferred appointment times are recorded as customer requests. The dispatcher confirms actual availability, verifies coverage in the requested postal area, and coordinates scheduling before assignment.",
    },
    {
      q: "Can field technicians prepare quotations and record consumed spare parts?",
      a: "Yes. Using the mobile technician workspace, field technicians can inspect equipment, record consumed inventory items, take before-and-after photos, and submit quotation drafts subject to owner review.",
    },
    {
      q: "Does ServiceSaathi handle partial payments and GST invoicing?",
      a: "Yes. Quotations calculate GST using compliant basis points (e.g. 18%). When work completes, an immutable invoice is created. Multiple partial payments (Cash, UPI, Card) can be audited until the balance is zero.",
    },
    {
      q: "Can users belong to multiple service businesses?",
      a: "Yes. Technicians or managers working across multiple branches or separate service entities can switch their active workspace instantly without logging out.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy-900 font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-navy-200/80 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-navy-950">
                  ServiceSaathi
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  India SaaS
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-navy-600">
              <Link href="#workflow" className="hover:text-navy-950 transition">
                {locale === "ta" ? "செயல்முறை" : "How It Works"}
              </Link>
              <Link href="#features" className="hover:text-navy-950 transition">
                {locale === "ta" ? "அம்சங்கள்" : "Features"}
              </Link>
              <Link href="#pricing" className="hover:text-navy-950 transition">
                {locale === "ta" ? "கட்டணம்" : "Pricing"}
              </Link>
              <Link href="/portal" className="text-teal-700 hover:text-teal-900 font-bold">
                {locale === "ta" ? "வாடிக்கையாளர் தளம்" : "Customer Portal"}
              </Link>
              <Link
                href="/3d"
                className="inline-flex items-center gap-1 text-teal-800 hover:text-teal-950 font-extrabold bg-teal-50 px-2.5 py-1 rounded-full border border-teal-300 shadow-xs transition"
              >
                <Sparkles className="h-3 w-3 text-teal-600 animate-spin" />
                <span>3D Studio</span>
                <span className="text-[9px] bg-teal-600 text-white px-1 rounded-sm uppercase tracking-wider font-mono">
                  NEW
                </span>
              </Link>
              <Link href="#faq" className="hover:text-navy-950 transition">
                FAQ
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
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
              className="rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-teal-700 focus:ring-2 focus:ring-teal-500"
            >
              {locale === "ta" ? "பதிவு செய்க" : "Get Started"}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Interactive 3D Miniature Service Neighbourhood */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white pt-12 pb-16 sm:pt-16 sm:pb-24 border-b border-navy-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Copy Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
                <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                <span>Multi-Business Field Management Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-navy-950 leading-[1.1]">
                Every service. <br className="hidden sm:block" />
                <span className="text-teal-600">One organised workspace.</span>
              </h1>

              <p className="text-base sm:text-lg leading-relaxed text-navy-600 max-w-xl">
                {locale === "ta"
                  ? "வாடிக்கையாளர் முன்பதிவு முதல் தொழில்நுட்ப நிபுணர் ஒதுக்கீடு, ஆன்-சைட் சரிபார்ப்புப் பட்டியல், ஜிஎஸ்டி விலைப்பட்டியல் மற்றும் வாடிக்கையாளர் ஒப்புதல் வரை — அனைத்தும் ஒரே நம்பகமான அமைப்பில்."
                  : "Connect customer bookings, technician dispatch calendars, mobile checklists, versioned quotations, and audited invoice collections in a single multi-tenant workspace."}
              </p>

              {/* Primary Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-teal-700 transition"
                >
                  <span>Start your business workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/3d"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-700 px-5 py-3.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition"
                >
                  <Sparkles className="h-4 w-4 text-teal-400" />
                  <span>Launch 3D Studio</span>
                  <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-1.5 py-0.5 rounded-full font-mono">
                    Three.js
                  </span>
                </Link>

                <a
                  href="#workflow"
                  className="inline-flex items-center gap-2 rounded-xl border border-navy-300 bg-white px-4 py-3.5 text-sm font-semibold text-navy-800 shadow-sm hover:bg-navy-50 transition"
                >
                  <span>See how it works</span>
                </a>
              </div>

              {/* Accessible Category Information Mirror */}
              <div className="pt-4 border-t border-navy-100">
                <span className="text-xs font-bold uppercase tracking-wider text-navy-500 block mb-2">
                  Highlight Category in Dispatch Simulation:
                </span>

                <div className="p-3.5 rounded-xl bg-white border border-navy-200/90 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-navy-950 flex items-center gap-1.5">
                      <span>{categoryDetails[activeCategory].icon}</span>
                      <span>
                        {locale === "ta"
                          ? categoryDetails[activeCategory].taTitle
                          : categoryDetails[activeCategory].title}
                      </span>
                    </span>
                    <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      Active Scene Element
                    </span>
                  </div>
                  <p className="text-xs text-navy-600 leading-relaxed">
                    {categoryDetails[activeCategory].desc}
                  </p>
                </div>
              </div>

              {/* Live Demo Quick Links */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-navy-500">
                <span className="font-semibold text-navy-700">Preloaded Demos:</span>
                <Link
                  href="/b/coolbreeze"
                  className="underline decoration-teal-500 underline-offset-4 text-teal-700 font-semibold hover:text-teal-900"
                >
                  CoolBreeze AC Chennai (/b/coolbreeze)
                </Link>
                <span>•</span>
                <Link
                  href="/b/apexcare"
                  className="underline decoration-teal-500 underline-offset-4 text-teal-700 font-semibold hover:text-teal-900"
                >
                  Apex Care Coimbatore (/b/apexcare)
                </Link>
                <span>•</span>
                <Link
                  href="/portal"
                  className="underline decoration-teal-500 underline-offset-4 text-teal-700 font-semibold hover:text-teal-900"
                >
                  Customer Portal (/portal)
                </Link>
              </div>
            </div>

            {/* Right 3D Experience Column */}
            <div className="lg:col-span-6">
              <Neighborhood3DScene
                selectedCategory={activeCategory}
                onSelectCategory={(cat) => setActiveCategory(cat)}
              />

              {/* Direct Fullscreen 3D Link Teaser */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs shadow-md">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                  <span className="font-semibold text-slate-300">Fullscreen Three.js Studio:</span>
                  <span className="text-teal-300 font-medium">AC Exploded View & MCB Diagnostics</span>
                </div>
                <Link
                  href="/3d"
                  className="font-bold text-teal-400 hover:text-teal-300 underline underline-offset-4 flex items-center gap-1 transition"
                >
                  <span>Open 3D Studio</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking-to-Invoice Illustrated Workflow */}
      <section className="py-20 bg-white border-b border-navy-100" id="workflow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Reliable Lifecycle
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-navy-950 sm:text-4xl">
              {locale === "ta" ? "முழுமையான செயல்முறை" : "Illustrated Booking-to-Invoice Lifecycle"}
            </h2>
            <p className="mt-3 text-sm text-navy-600">
              Every job follows a verifiable sequence that protects both the business and the customer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="rounded-2xl bg-slate-50/70 p-6 border border-navy-200/80 shadow-sm relative hover:border-teal-300 transition">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white font-black text-sm mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-navy-950">1. Customer Booking</h3>
              <p className="mt-2 text-xs text-navy-600 leading-relaxed">
                Customer selects service, answers trade-specific questions, provides photos, and requests a preferred time slot within your validated service pincodes.
              </p>
              <div className="mt-4 pt-3 border-t border-navy-200/60 text-[11px] font-semibold text-teal-800">
                Pincode boundary check & duplicate protection
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50/70 p-6 border border-navy-200/80 shadow-sm relative hover:border-teal-300 transition">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white font-black text-sm mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-navy-950">2. Dispatch Coordination</h3>
              <p className="mt-2 text-xs text-navy-600 leading-relaxed">
                Dispatcher reviews unassigned requests, verifies worker schedules, detects overlap conflicts on the server, and notifies technician and customer.
              </p>
              <div className="mt-4 pt-3 border-t border-navy-200/60 text-[11px] font-semibold text-teal-800">
                Conflict warnings & double-booking prevention
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50/70 p-6 border border-navy-200/80 shadow-sm relative hover:border-teal-300 transition">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white font-black text-sm mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-navy-950">3. Field Inspection & Quote</h3>
              <p className="mt-2 text-xs text-navy-600 leading-relaxed">
                Technician arrives on-site, completes mandatory safety checklists, uploads before-photos, and sends a versioned quotation with secure customer approval link.
              </p>
              <div className="mt-4 pt-3 border-t border-navy-200/60 text-[11px] font-semibold text-teal-800">
                Signed approval tokens & revision audit
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50/70 p-6 border border-navy-200/80 shadow-sm relative hover:border-teal-300 transition">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white font-black text-sm mb-4">
                4
              </div>
              <h3 className="text-base font-bold text-navy-950">4. Invoicing & Payment</h3>
              <p className="mt-2 text-xs text-navy-600 leading-relaxed">
                Approved work converts into an immutable GST invoice. Record partial or full payments via UPI, Cash, or Card with automated stock deduction.
              </p>
              <div className="mt-4 pt-3 border-t border-navy-200/60 text-[11px] font-semibold text-teal-800">
                Immutable snapshots & partial payment ledger
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Product Previews */}
      <section className="py-20 bg-slate-50 border-b border-navy-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Tailored Interfaces
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-navy-950 sm:text-4xl">
              Role-Based Workspaces Built for Purpose
            </h2>
            <p className="mt-3 text-sm text-navy-600">
              Each user sees exactly the tools and data they need to perform their role without clutter or privilege leakage.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Owner & Dispatcher Preview */}
            <div className="rounded-2xl bg-white p-6 border border-navy-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                    OD
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase text-navy-900 block">
                      Owner & Dispatcher
                    </span>
                    <span className="text-[10px] text-navy-500">Operations Control Center</span>
                  </div>
                </div>

                <p className="text-xs text-navy-600 leading-relaxed mb-4">
                  Full business visibility: revenue metrics, scheduling calendar, inventory movements, staff invitation controls, and formula-safe CSV reports.
                </p>

                <div className="rounded-xl bg-slate-50 border border-navy-200 p-3 space-y-2 text-xs">
                  <div className="flex justify-between font-semibold text-navy-800">
                    <span>Active Jobs Today</span>
                    <span className="font-mono text-teal-700">14 Jobs</span>
                  </div>
                  <div className="flex justify-between font-semibold text-navy-800">
                    <span>Pending Customer Quotes</span>
                    <span className="font-mono text-amber-700">₹42,800</span>
                  </div>
                  <div className="flex justify-between font-semibold text-navy-800">
                    <span>Low Stock Alerts</span>
                    <span className="font-mono text-red-600">3 Parts</span>
                  </div>
                </div>
              </div>

              <Link
                href="/login"
                className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-xl border border-navy-300 py-2.5 text-xs font-bold text-navy-800 hover:bg-navy-50 transition"
              >
                <span>Launch Operations Demo</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Field Technician Preview */}
            <div className="rounded-2xl bg-white p-6 border border-navy-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                    TECH
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase text-navy-900 block">
                      Technician Field Mobile
                    </span>
                    <span className="text-[10px] text-navy-500">Touch-Optimized Field App</span>
                  </div>
                </div>

                <p className="text-xs text-navy-600 leading-relaxed mb-4">
                  Designed for one-hand use in the field. En-route timestamps, navigation shortcuts, mandatory checklist validation, and photo evidence uploads.
                </p>

                <div className="rounded-xl bg-slate-50 border border-navy-200 p-3 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Inspection Checklist (8/8 Required)</span>
                  </div>
                  <div className="flex items-center gap-2 text-teal-700 font-semibold">
                    <Boxes className="h-4 w-4" />
                    <span>Logged Consumed 50μF Capacitor</span>
                  </div>
                  <div className="flex items-center gap-2 text-navy-700 font-semibold">
                    <Smartphone className="h-4 w-4" />
                    <span>Strict Assignment-Only Access</span>
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard/technician"
                className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-xl border border-navy-300 py-2.5 text-xs font-bold text-navy-800 hover:bg-navy-50 transition"
              >
                <span>View Field Technician View</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Customer Portal Preview */}
            <div className="rounded-2xl bg-white p-6 border border-navy-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                    CUST
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase text-navy-900 block">
                      Customer Service Portal
                    </span>
                    <span className="text-[10px] text-navy-500">Self-Service Hub</span>
                  </div>
                </div>

                <p className="text-xs text-navy-600 leading-relaxed mb-4">
                  Customers view appointment timelines, review and approve quotation revisions, download invoices, submit service feedback, and lodge warranty complaints.
                </p>

                <div className="rounded-xl bg-slate-50 border border-navy-200 p-3 space-y-2 text-xs">
                  <div className="flex justify-between font-semibold text-navy-800">
                    <span>Live Booking Status</span>
                    <span className="text-emerald-700 font-bold">Confirmed</span>
                  </div>
                  <div className="flex justify-between font-semibold text-navy-800">
                    <span>Quotation Token Link</span>
                    <span className="text-teal-700 font-mono">1-Click Approve</span>
                  </div>
                  <div className="flex justify-between font-semibold text-navy-800">
                    <span>Resolution Tracking</span>
                    <span className="text-navy-600">Public updates only</span>
                  </div>
                </div>
              </div>

              <Link
                href="/portal"
                className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-xl border border-teal-600 bg-teal-50/50 py-2.5 text-xs font-bold text-teal-800 hover:bg-teal-50 transition"
              >
                <span>Visit Customer Portal</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3D Digital Twin & Interactive Engineering Studio Showcase */}
      <section className="py-20 bg-slate-950 text-white relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,148,136,0.18),rgba(255,255,255,0))]" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-400 mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Three.js WebGL Hardware-Accelerated Simulation</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                Interactive 3D Digital Twins <br />
                <span className="text-teal-400">&amp; Diagnostic Engineering</span>
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
                Step inside the equipment your team services. Inspect exploded sub-assemblies, test live electrical loads, trigger simulated component faults, and activate FLIR infrared heat vision directly in the browser.
              </p>
            </div>

            <Link
              href="/3d"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 px-5 py-3 font-black text-xs shadow-lg shadow-teal-500/20 transition shrink-0"
            >
              <span>Open Fullscreen Studio</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: HVAC Split AC */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between hover:border-teal-500/50 transition group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center font-bold">
                    <Snowflake className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-teal-400 bg-teal-950 px-2.5 py-1 rounded-full border border-teal-800">
                    FLIR Thermal Mode
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition">
                  Split AC Condenser Diagnostic
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Interactive exploded assembly with rotary compressor, copper U-bend fins, BLDC fan, and false-color FLIR infrared heat imaging.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5 text-[10px] text-slate-300 font-medium">
                  <span className="bg-slate-800 px-2 py-0.5 rounded">0-100% Exploded View</span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded">Refrigerant Cycle</span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded">95°C Heat Sensor</span>
                </div>
              </div>

              <Link
                href="/3d?scene=ac"
                className="mt-6 inline-flex items-center justify-between text-xs font-bold text-teal-400 group-hover:text-teal-300 pt-3 border-t border-slate-800"
              >
                <span>Launch AC Digital Twin</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition" />
              </Link>
            </div>

            {/* Card 2: MCB Electrical Panel */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between hover:border-amber-500/50 transition group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
                    <Zap className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-950 px-2.5 py-1 rounded-full border border-amber-800">
                    Live Load Meter
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition">
                  MCB Breaker Distribution Panel
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Dual-pole 63A isolator and 5-circuit breakers. Toggle live circuits with real-time amperage calculations and simulated overload spark trips.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5 text-[10px] text-slate-300 font-medium">
                  <span className="bg-slate-800 px-2 py-0.5 rounded">Interactive Switches</span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded">Spark Particles</span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded">26A Overload Simulation</span>
                </div>
              </div>

              <Link
                href="/3d?scene=electrical"
                className="mt-6 inline-flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300 pt-3 border-t border-slate-800"
              >
                <span>Launch Electrical Twin</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition" />
              </Link>
            </div>

            {/* Card 3: Solar PV Rooftop */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between hover:border-yellow-500/50 transition group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 flex items-center justify-center font-bold">
                    <SunMedium className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-yellow-400 bg-yellow-950 px-2.5 py-1 rounded-full border border-yellow-800">
                    Jet Clean Simulation
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-yellow-300 transition">
                  Rooftop Solar PV &amp; Hybrid Inverter
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Bifacial monocrystalline PV panels, 5kW hybrid inverter, 5.1kWh LiFePO4 battery storage, and interactive water jet panel washing.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5 text-[10px] text-slate-300 font-medium">
                  <span className="bg-slate-800 px-2 py-0.5 rounded">Energy Flow Particles</span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded">Dust Soiling Wash</span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded">DC String Isolator</span>
                </div>
              </div>

              <Link
                href="/3d?scene=solar"
                className="mt-6 inline-flex items-center justify-between text-xs font-bold text-yellow-400 group-hover:text-yellow-300 pt-3 border-t border-slate-800"
              >
                <span>Launch Solar PV Twin</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition" />
              </Link>
            </div>

            {/* Card 4: CCTV Security Speed Dome */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between hover:border-emerald-500/50 transition group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
                    <Camera className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
                    Interactive PTZ
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition">
                  4K Motorized PTZ Dome Camera
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Precision dual-axis motorized stepper turret with 8x infrared IR matrix ring, rackmount NVR unit, Cat6 patch routing, and live pan/tilt joystick.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5 text-[10px] text-slate-300 font-medium">
                  <span className="bg-slate-800 px-2 py-0.5 rounded">Directional D-Pad</span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded">IR Night Vision</span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded">PoE Switch &amp; NVR</span>
                </div>
              </div>

              <Link
                href="/3d?scene=cctv"
                className="mt-6 inline-flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:text-emerald-300 pt-3 border-t border-slate-800"
              >
                <span>Launch CCTV Twin</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition" />
              </Link>
            </div>

            {/* Card 5: Booster Pump Manifold */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between hover:border-sky-500/50 transition group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center font-bold">
                    <Droplets className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-sky-400 bg-sky-950 px-2.5 py-1 rounded-full border border-sky-800">
                    Hydraulic Simulation
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition">
                  Pressure Booster Pump Manifold
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Heavy cast-iron volute impeller motor, dynamic pressure gauge needle oscillation, blue expansion tank, and simulated spray leak detection.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5 text-[10px] text-slate-300 font-medium">
                  <span className="bg-slate-800 px-2 py-0.5 rounded">Turnable Ball Valve</span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded">Water Particles</span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded">Dial Needle Gauge</span>
                </div>
              </div>

              <Link
                href="/3d?scene=plumbing"
                className="mt-6 inline-flex items-center justify-between text-xs font-bold text-sky-400 group-hover:text-sky-300 pt-3 border-t border-slate-800"
              >
                <span>Launch Plumbing Twin</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition" />
              </Link>
            </div>

            {/* Card 6: Smart City Dispatch Map */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between hover:border-teal-500/50 transition group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center font-bold">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-teal-400 bg-teal-950 px-2.5 py-1 rounded-full border border-teal-800">
                    Monsoon Weather
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition">
                  Smart Metropolitan Dispatch Hub
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Circulating service vans across 42 pincodes, central dispatch radio antenna, day/sunset/night streetlamp lighting, and monsoonal storm weather.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5 text-[10px] text-slate-300 font-medium">
                  <span className="bg-slate-800 px-2 py-0.5 rounded">Live Van Fleet</span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded">Rain Simulation</span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded">Day / Sunset / Night</span>
                </div>
              </div>

              <Link
                href="/3d?scene=city"
                className="mt-6 inline-flex items-center justify-between text-xs font-bold text-teal-400 group-hover:text-teal-300 pt-3 border-t border-slate-800"
              >
                <span>Launch Dispatch Twin</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grouped by Business Task */}
      <section className="py-20 bg-white border-b border-navy-100" id="features">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Engineered For Indian Trades
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-navy-950 sm:text-4xl">
              Features Grouped by Business Task
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-navy-950">Dispatch & Conflict Prevention</h3>
              <p className="text-xs text-navy-600 leading-relaxed">
                Filter jobs by date, technician, and category. Enforces server-side validation to eliminate double-booking overlaps when assigning workers.
              </p>
            </div>

            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-navy-950">Tenant Isolation & RBAC</h3>
              <p className="text-xs text-navy-600 leading-relaxed">
                Strong multi-tenant boundaries. Last-owner protection prevents accidental lockout. Staff invitation tokens are single-use with automatic expiration.
              </p>
            </div>

            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Receipt className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-navy-950">GST Invoices & Partial Payments</h3>
              <p className="text-xs text-navy-600 leading-relaxed">
                Automated Indian GST tax calculations, sequential invoice numbering, immutable snapshots, and an audited payment ledger supporting Cash, UPI, and Card.
              </p>
            </div>

            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Boxes className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-navy-950">Inventory & Stock Consumption</h3>
              <p className="text-xs text-navy-600 leading-relaxed">
                Track spare parts with SKU, reorder thresholds, and unit costs. Parts consumed during field jobs are automatically recorded with audit movements.
              </p>
            </div>

            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-navy-950">Versioned Quotation Approvals</h3>
              <p className="text-xs text-navy-600 leading-relaxed">
                Issue quotations with cryptographic approval links. Customers can approve or reject online. Revisions generate tracked versions without overwriting records.
              </p>
            </div>

            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-navy-950">Safe Transactional Outbox</h3>
              <p className="text-xs text-navy-600 leading-relaxed">
                Asynchronous event processing for booking alerts and customer receipts. Includes automatic retries, delivery inspection, and dead-letter handling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Pricing */}
      <section className="py-20 bg-slate-50 border-b border-navy-100" id="pricing">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Clear Subscription Pricing
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-navy-950 sm:text-4xl">
              {locale === "ta" ? "சந்தா திட்டங்கள்" : "Transparent Plans for Service Companies"}
            </h2>
            <p className="mt-3 text-sm text-navy-600">
              Pay ServiceSaathi a simple monthly software fee. 100% of customer job payments remain yours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="rounded-2xl border border-navy-200 p-6 bg-white shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-navy-600">Starter</span>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-navy-950">₹1,499</span>
                  <span className="text-xs text-navy-500">/ month + GST</span>
                </div>
                <p className="mt-2 text-xs text-navy-600">For solo technicians and small workshops.</p>

                <ul className="mt-6 space-y-2.5 text-xs text-navy-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 flex-shrink-0" />
                    <span>Up to 3 Staff Members</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 flex-shrink-0" />
                    <span>Dedicated Public Booking Link</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 flex-shrink-0" />
                    <span>Pincode Area Validation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 flex-shrink-0" />
                    <span>Tax Invoices & Partial Payments</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="mt-8 block text-center rounded-xl border border-teal-600 py-2.5 text-xs font-bold text-teal-700 hover:bg-teal-50 transition"
              >
                Choose Starter
              </Link>
            </div>

            {/* Growth */}
            <div className="rounded-2xl border-2 border-teal-600 p-6 bg-white shadow-md relative flex flex-col justify-between">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-teal-600 px-3 py-0.5 text-[10px] font-bold uppercase text-white tracking-wider">
                Recommended For Teams
              </span>

              <div>
                <span className="text-xs font-bold uppercase text-teal-700">Growth</span>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-navy-950">₹2,999</span>
                  <span className="text-xs text-navy-500">/ month + GST</span>
                </div>
                <p className="mt-2 text-xs text-navy-600">For multi-van service centers and expanding companies.</p>

                <ul className="mt-6 space-y-2.5 text-xs text-navy-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 flex-shrink-0" />
                    <span>Up to 15 Staff & Field Technicians</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 flex-shrink-0" />
                    <span>Everything in Starter</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 flex-shrink-0" />
                    <span>Parts Inventory & Stock Ledger</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 flex-shrink-0" />
                    <span>Annual Maintenance Contract (AMC) Management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 flex-shrink-0" />
                    <span>Transactional Email & SMS Outbox</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="mt-8 block text-center rounded-xl bg-teal-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition"
              >
                Start Growth 14-Day Free Trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl border border-navy-200 p-6 bg-white shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-navy-600">Enterprise</span>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-navy-950">₹5,999</span>
                  <span className="text-xs text-navy-500">/ month + GST</span>
                </div>
                <p className="mt-2 text-xs text-navy-600">For multi-branch networks and regional franchisees.</p>

                <ul className="mt-6 space-y-2.5 text-xs text-navy-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 flex-shrink-0" />
                    <span>Unlimited Staff & Technicians</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 flex-shrink-0" />
                    <span>Multi-Branch Operating Schedules</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 flex-shrink-0" />
                    <span>Custom Inspection Checklist Versions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 flex-shrink-0" />
                    <span>Dedicated Support & CSV Automation</span>
                  </li>
                </ul>
              </div>

              <Link
                href="#contact"
                className="mt-8 block text-center rounded-xl border border-navy-300 py-2.5 text-xs font-bold text-navy-800 hover:bg-navy-50 transition"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-20 bg-white border-b border-navy-100" id="faq">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Frequently Asked Questions
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-navy-950">
              Operational & Technical Clarifications
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-navy-200/90 overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between bg-white hover:bg-slate-50 transition"
                    aria-expanded={isOpen}
                  >
                    <span className="text-xs sm:text-sm font-bold text-navy-950">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-navy-400 transition-transform ${
                        isOpen ? "rotate-180 text-teal-600" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-1 bg-slate-50 border-t border-navy-100 text-xs text-navy-600 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Demo Request / Contact Section */}
      <section className="py-20 bg-slate-50" id="contact">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="rounded-2xl border border-navy-200/80 bg-white p-8 sm:p-10 shadow-sm">
            <div className="text-center mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
                Direct Specialist Consultation
              </span>
              <h2 className="mt-2 text-2xl font-extrabold text-navy-950">
                Request a Controlled Pilot Demonstration
              </h2>
              <p className="mt-1 text-xs text-navy-500">
                Submissions are validated and stored in our database for prompt follow-up.
              </p>
            </div>

            {submitSuccess && (
              <div className="mb-6 rounded-lg bg-emerald-50 p-4 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>{submitSuccess}</span>
              </div>
            )}

            {submitError && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 text-xs font-medium text-red-800">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-navy-300 px-3 py-2 text-xs text-navy-900 focus:border-teal-500 focus:outline-none"
                    placeholder="e.g. Anand Sundaram"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-700 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full rounded-lg border border-navy-300 px-3 py-2 text-xs text-navy-900 focus:border-teal-500 focus:outline-none"
                    placeholder="e.g. Sundaram Aircon Solutions"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-700 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-lg border border-navy-300 px-3 py-2 text-xs text-navy-900 focus:border-teal-500 focus:outline-none"
                    placeholder="+91 98400 12345"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-700 mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-navy-300 px-3 py-2 text-xs text-navy-900 focus:border-teal-500 focus:outline-none"
                    placeholder="anand@sundaramaircon.in"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-700 mb-1">
                  Primary Service Domain
                </label>
                <select
                  value={formData.serviceCategory}
                  onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value })}
                  className="w-full rounded-lg border border-navy-300 px-3 py-2 text-xs text-navy-900 focus:border-teal-500 focus:outline-none"
                >
                  <option value="AC installation and repair">AC installation and repair</option>
                  <option value="Home appliance repair">Home appliance repair</option>
                  <option value="Electrical services">Electrical services</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Solar and inverter maintenance">Solar and inverter maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-700 mb-1">
                  Current Workflow & Pilot Requirements
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full rounded-lg border border-navy-300 px-3 py-2 text-xs text-navy-900 focus:border-teal-500 focus:outline-none"
                  placeholder="Share details such as active field team size, current cities served, and areas where dispatch needs improvement..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-xs font-bold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50 transition"
              >
                {isSubmitting ? (
                  <span>Recording submission...</span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit Pilot Request</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-navy-200 bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-navy-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-navy-950">ServiceSaathi</span>
            <span>• SaaS Infrastructure for Indian Trade Businesses</span>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <Link href="/3d" className="font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-teal-600" />
              <span>3D Studio</span>
            </Link>
            <Link href="/portal" className="font-semibold text-teal-700 hover:text-teal-900">
              Customer Portal
            </Link>
            <Link href="/login" className="hover:text-navy-900">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-navy-900">
              Register Workspace
            </Link>
            <Link href="#pricing" className="hover:text-navy-900">
              Pricing Plans
            </Link>
            <Link href="/api/health" className="hover:text-navy-900" target="_blank">
              Health Status
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
