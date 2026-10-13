"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ConnectivityIndicator } from "@/components/ui/ConnectivityIndicator";
import {
  Wrench,
  Snowflake,
  Tv,
  Zap,
  Droplets,
  Sparkles,
  Laptop,
  Camera,
  Paintbrush,
  Car,
  Bug,
  Sun,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function ServicesPage() {
  const { t, locale } = useTranslation();

  const categories = [
    {
      id: "ac",
      title: "HVAC & Air Conditioning",
      taTitle: "ஏசி பொருத்துதல் மற்றும் பழுதுபார்த்தல்",
      desc: "Split and window AC installation, high-pressure jet pump cleaning, gas charging (R32/R410A), capacitor replacement, and copper piping.",
      icon: Snowflake,
      typicalServices: ["Jet Spray Deep Cleaning", "Capacitor & Fan Motor Repair", "Complete 1.5T Split Installation", "Gas Leakage Test & Refill"],
      pricingModel: "Fixed rates for servicing; inspection fee for diagnostic faults.",
    },
    {
      id: "appliances",
      title: "Home Appliance Repair",
      taTitle: "வீட்டு உபயோகப் பொருட்கள் பழுது",
      desc: "Front-load & top-load washing machines, double-door refrigerators, microwave ovens, water purifiers, and kitchen chimneys.",
      icon: Tv,
      typicalServices: ["Washing Machine Drum & Motor Repair", "Refrigerator Compressor Replacement", "RO Filter Membrane Change", "Chimney Degreasing"],
      pricingModel: "Standard ₹299 inspection fee credited against final repair quotation.",
    },
    {
      id: "electrical",
      title: "Electrical & Inverter Systems",
      taTitle: "மின்சார வேலைகள் மற்றும் இன்வெர்ட்டர்",
      desc: "Commercial distribution boards, MCB upgrades, complete house rewiring, earthing testing, UPS/inverter installation, and short-circuit tracing.",
      icon: Zap,
      typicalServices: ["MCB Tripping & Short Circuit Fix", "Inverter & Tubular Battery Setup", "Complete 3BHK Rewiring", "Earthing & Surge Protection"],
      pricingModel: "Per-point or custom project quote after site survey.",
    },
    {
      id: "plumbing",
      title: "Sanitary & Water Infrastructure",
      taTitle: "குழாய் மற்றும் பிளம்பிங் பணிகள்",
      desc: "Concealed pipeline leak detection, booster pump installation, overhead storage tank cleaning, bathroom fittings, and drain unclogging.",
      icon: Droplets,
      typicalServices: ["Overhead Water Tank Sanitization", "Booster Pump Installation", "Concealed Wall Leakage Tracing", "CP Fitting & Diverter Repair"],
      pricingModel: "Fixed task pricing for standard replacements; hourly for complex piping.",
    },
    {
      id: "cleaning",
      title: "Deep Sanitization & Pest Control",
      taTitle: "வீடு சுத்தம் மற்றும் பூச்சி கட்டுப்பாடு",
      desc: "Mechanized single-disc floor scrubbing, antibacterial sofa/mattress shampooing, bathroom descaling, and herbal termite treatment.",
      icon: Sparkles,
      typicalServices: ["Full House Deep Sanitization", "Antibacterial Sofa Shampooing", "Kitchen Degreasing & Descaling", "Herbal Termite Protection"],
      pricingModel: "Square footage or room-count tiered packages.",
    },
    {
      id: "cctv",
      title: "CCTV, WiFi & Networking",
      taTitle: "சிசிடிவி மற்றும் நெட்வொர்க்கிங்",
      desc: "IP camera setup, NVR configuration, CAT6 cable termination, enterprise mesh WiFi access points, and biometric access control.",
      icon: Camera,
      typicalServices: ["4-Camera IP CCTV Kit Installation", "CAT6 Structured Cabling", "Dual-Band Mesh WiFi Setup", "Biometric Attendance Reader"],
      pricingModel: "Device hardware quotation plus standard technician day rate.",
    },
    {
      id: "solar",
      title: "Solar & Rooftop Energy",
      taTitle: "சூரிய மின்சக்தி அமைப்புகள்",
      desc: "On-grid solar panel washing, net metering inspection, MPPT inverter diagnostics, battery bank maintenance, and wire tightening.",
      icon: Sun,
      typicalServices: ["Solar Array High-Pressure Wash", "Net Metering Inverter Check", "Lead-Acid/Lithium Battery Test", "Annual Maintenance Contract"],
      pricingModel: "Monthly/Quarterly recurring AMC plans.",
    },
    {
      id: "computers",
      title: "Computer & IT Equipment",
      taTitle: "கணினி மற்றும் மடிக்கணினி பழுது",
      desc: "Laptop hinge repair, SSD upgrades, thermal paste re-application, OS formatting, and commercial desktop maintenance.",
      icon: Laptop,
      typicalServices: ["NVMe SSD Upgrade & OS Clone", "Motherboard Chip-Level Repair", "Thermal Paste & Dust Cleanup", "Broken Screen Replacement"],
      pricingModel: "Free diagnostics at shop, doorstep pickup with fixed service fee.",
    },
    {
      id: "painting",
      title: "Painting & Woodwork Carpentry",
      taTitle: "பெயிண்டிங் மற்றும் தச்சு வேலை",
      desc: "Interior emulsion, exterior weatherproofing, door hinge adjustment, modular kitchen repairs, and wooden polish.",
      icon: Paintbrush,
      typicalServices: ["Waterproof Wall Dampness Treatment", "Interior Emulsion 2-Coat Paint", "Modular Cabinet Hinge Fix", "Solid Wood Door Polishing"],
      pricingModel: "Written estimation with labour and material line items.",
    },
    {
      id: "vehicle",
      title: "Vehicle Doorstep Mechanics",
      taTitle: "வாகன பழுது & மெக்கானிக் சேவைகள்",
      desc: "Two-wheeler periodic maintenance, jump-start assistance, synthetic oil change, brake pad replacement, and puncture repair.",
      icon: Car,
      typicalServices: ["Doorstep 2-Wheeler Oil Service", "Dead Battery Jumpstart", "Brake Shoe & Cable Replacement", "Pre-Purchase Bike Inspection"],
      pricingModel: "Fixed transparent labour fees plus MRP spare parts billing.",
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
              <Link href="/services" className="text-teal-700 font-bold">
                {locale === "ta" ? "சேவைகள்" : "Services"}
              </Link>
              <Link
                href="/3d"
                className="inline-flex items-center gap-1 text-teal-800 font-extrabold bg-teal-50 px-2.5 py-1 rounded-full border border-teal-300"
              >
                <Sparkles className="h-3 w-3 text-teal-600 animate-spin" />
                <span>3D Studio</span>
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
            <span>Specialized Workflows for Every Trade</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-navy-950 tracking-tight">
            Tailored for over 10+ local service categories
          </h1>
          <p className="mx-auto max-w-2xl text-sm sm:text-base text-navy-600 leading-relaxed">
            Each vertical includes pre-configured equipment checklists, transparent pricing models, and category-specific booking questionnaires.
          </p>

          {/* Interactive 3D Callout */}
          <div className="pt-2">
            <Link
              href="/3d"
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs font-bold shadow-md hover:bg-slate-800 hover:border-teal-400 transition"
            >
              <Sparkles className="h-4 w-4 text-teal-400" />
              <span>Explore in Interactive 3D (Three.js Studio)</span>
              <ArrowRight className="h-3.5 w-3.5 text-teal-300" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services Catalog */}
      <section className="py-16 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="bg-white rounded-2xl border border-navy-200/80 p-6 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex-shrink-0">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-navy-950">
                      {locale === "ta" ? cat.taTitle : cat.title}
                    </h3>
                    <p className="text-xs text-navy-600 mt-1 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3.5 border border-navy-100 space-y-2 text-xs">
                  <span className="font-bold text-navy-800 block text-[11px] uppercase tracking-wider">
                    Common Service Operations:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-navy-700">
                    {cat.typicalServices.map((srv, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-teal-600 flex-shrink-0" />
                        <span className="truncate">{srv}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-navy-200/60 text-[11px] text-navy-500 italic">
                    Pricing structure: {cat.pricingModel}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-navy-950 text-white py-12 px-4 sm:px-6 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold">Have a custom service business?</h3>
            <p className="text-xs text-navy-300 mt-1">
              Add your own custom services, hourly pricing formulas, and checklists in minutes.
            </p>
          </div>
          <Link
            href="/register"
            className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-navy-950 font-bold text-xs shadow-md transition flex items-center gap-2"
          >
            <span>Set Up Your Services</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
