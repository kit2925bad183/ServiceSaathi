"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ConnectivityIndicator } from "@/components/ui/ConnectivityIndicator";
import {
  Wrench,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Building,
} from "lucide-react";

export default function ContactPage() {
  const { t, locale } = useTranslation();

  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [serviceCategory, setServiceCategory] = useState("AC installation and repair");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          businessName,
          phone,
          email,
          serviceCategory,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit inquiry");

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

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
              <Link href="/pricing" className="hover:text-navy-950 transition">
                {locale === "ta" ? "கட்டணம்" : "Pricing"}
              </Link>
              <Link href="/contact" className="text-teal-700 font-bold">
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

      {/* Main Content */}
      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
              <span>India Operations & Support</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-navy-950 tracking-tight">
              Talk to our product and onboarding specialists
            </h1>
            <p className="text-sm text-navy-600 leading-relaxed">
              Whether you need assistance importing your existing customer database or want a personalized pilot walkthrough, our team is ready to support you.
            </p>

            <div className="space-y-4 pt-4 border-t border-navy-100 text-xs text-navy-700">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-teal-700">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-navy-900 block">+91 44 2812 3456</span>
                  <span className="text-[11px] text-navy-500">Mon - Sat, 9:00 AM - 7:00 PM IST</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-teal-700">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-navy-900 block">support@servicesaathi.in</span>
                  <span className="text-[11px] text-navy-500">Typical response time: under 2 hours</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-teal-700">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-navy-900 block">Chennai & Coimbatore Hubs</span>
                  <span className="text-[11px] text-navy-500">Tamil Nadu, India</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-navy-200/80 p-8 shadow-sm">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-navy-950">Inquiry Received</h3>
                  <p className="text-xs text-navy-600 max-w-md mx-auto leading-relaxed">
                    Thank you, <span className="font-bold text-navy-900">{name}</span>. A ServiceSaathi specialist will contact you at <span className="font-bold text-navy-900">{phone}</span> shortly.
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setMessage("");
                      }}
                      className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-lg font-bold text-navy-950 mb-2">
                    Request a Consultation or Pilot Walkthrough
                  </h2>

                  {error && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs font-semibold text-rose-700">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-navy-700 mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Rajesh Kumar"
                        className="w-full rounded-xl border border-navy-200 px-3 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-navy-700 mb-1">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="CoolBreeze Climate Solutions"
                        className="w-full rounded-xl border border-navy-200 px-3 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-navy-700 mb-1">
                        Phone Number (WhatsApp) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98400 11223"
                        className="w-full rounded-xl border border-navy-200 px-3 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-navy-700 mb-1">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contact@coolbreeze.in"
                        className="w-full rounded-xl border border-navy-200 px-3 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-700 mb-1">
                      Primary Service Category
                    </label>
                    <select
                      value={serviceCategory}
                      onChange={(e) => setServiceCategory(e.target.value)}
                      className="w-full rounded-xl border border-navy-200 px-3 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      <option value="AC installation and repair">AC & HVAC Installation/Repair</option>
                      <option value="Home appliance repair">Home Appliance Repair (Washing Machine, Fridge)</option>
                      <option value="Electrical services">Electrical Infrastructure & Inverter</option>
                      <option value="Plumbing services">Plumbing & Water Management</option>
                      <option value="Deep cleaning">Deep Sanitization & Pest Control</option>
                      <option value="CCTV & Networking">CCTV & Networking</option>
                      <option value="Solar maintenance">Solar Energy Maintenance</option>
                      <option value="Other">Other Local Service Business</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-700 mb-1">
                      How can we help your business? *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about your team size, current dispatch challenges, or custom workflow requirements..."
                      className="w-full rounded-xl border border-navy-200 px-3 py-2 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? "Submitting..." : "Submit Inquiry"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
