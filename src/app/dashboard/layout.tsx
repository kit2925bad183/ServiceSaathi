"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ConnectivityIndicator } from "@/components/ui/ConnectivityIndicator";
import {
  Wrench,
  LayoutDashboard,
  CalendarDays,
  Briefcase,
  Users,
  Layers,
  FileCheck2,
  Receipt,
  Boxes,
  BarChart3,
  Settings,
  LogOut,
  Smartphone,
  Menu,
  X,
  ExternalLink,
  Building2,
  ChevronDown,
  AlertCircle,
  Bell,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Business Switcher state
  const [activeBusinessSlug, setActiveBusinessSlug] = useState("coolbreeze");
  const [businesses, setBusinesses] = useState([
    {
      id: "biz_coolbreeze_chennai",
      slug: "coolbreeze",
      name: "CoolBreeze Climate Solutions",
      city: "Chennai",
      role: "OWNER",
    },
    {
      id: "biz_apexcare_cbe",
      slug: "apexcare",
      name: "Apex Power & Appliance Care",
      city: "Coimbatore",
      role: "DISPATCHER",
    },
  ]);
  const [switching, setSwitching] = useState(false);

  const navItems = [
    { href: "/dashboard", label: t.common.dashboard, icon: LayoutDashboard },
    { href: "/dashboard/technician", label: "Technician Field App", icon: Smartphone, highlight: true },
    { href: "/dashboard/jobs", label: "Dispatch Calendar", icon: CalendarDays },
    { href: "/dashboard/bookings", label: t.common.bookings, icon: Briefcase },
    { href: "/dashboard/customers", label: t.common.customers, icon: Users },
    { href: "/dashboard/catalogue", label: t.common.catalogue, icon: Layers },
    { href: "/dashboard/quotations", label: t.common.quotations, icon: FileCheck2 },
    { href: "/dashboard/invoices", label: t.common.invoices, icon: Receipt },
    { href: "/dashboard/inventory", label: t.common.inventory, icon: Boxes },
    { href: "/dashboard/complaints", label: "Complaints & Warranty", icon: AlertCircle },
    { href: "/dashboard/reports", label: t.common.reports, icon: BarChart3 },
    { href: "/dashboard/settings", label: t.common.settings, icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
    }
  };

  const handleSwitchBusiness = async (bizId: string, slug: string) => {
    if (slug === activeBusinessSlug) return;
    setSwitching(true);
    try {
      await fetch("/api/business/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetBusinessId: bizId }),
      });
      setActiveBusinessSlug(slug);
      router.refresh();
    } catch {
      setActiveBusinessSlug(slug);
    } finally {
      setSwitching(false);
    }
  };

  const activeBiz = businesses.find((b) => b.slug === activeBusinessSlug) || businesses[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-navy-900">
      {/* Mobile Top Navbar */}
      <div className="md:hidden flex items-center justify-between border-b border-navy-200 bg-white px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
            <Wrench className="h-4 w-4" />
          </div>
          <span className="font-black text-navy-950 text-base">ServiceSaathi</span>
        </div>

        <div className="flex items-center gap-2">
          <ConnectivityIndicator />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg border border-navy-200 text-navy-700"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar for Desktop & Mobile drawer */}
      <aside
        className={`${
          mobileMenuOpen ? "block" : "hidden"
        } md:block md:w-64 bg-white border-r border-navy-200/80 flex flex-col fixed md:sticky top-0 h-screen z-40 overflow-y-auto`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-navy-100 space-y-3">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-navy-950 block leading-tight">
                ServiceSaathi
              </span>
              <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider block">
                Workspace OS
              </span>
            </div>
          </Link>

          {/* Business Switcher Selector */}
          <div className="rounded-xl bg-slate-50 border border-navy-200 p-2 text-xs">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-navy-400 mb-1">
              <span>Active Workspace</span>
              <span className="text-teal-700 font-bold">{activeBiz.role}</span>
            </div>
            <select
              value={activeBusinessSlug}
              disabled={switching}
              onChange={(e) => {
                const target = businesses.find((b) => b.slug === e.target.value);
                if (target) handleSwitchBusiness(target.id, target.slug);
              }}
              className="w-full bg-white border border-navy-200 rounded-lg py-1 px-1.5 text-xs font-bold text-navy-900 focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              {businesses.map((biz) => (
                <option key={biz.id} value={biz.slug}>
                  {biz.name} ({biz.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  active
                    ? "bg-teal-50 text-teal-800 font-bold border border-teal-200"
                    : item.highlight
                    ? "text-teal-700 bg-teal-50/50 hover:bg-teal-50 border border-teal-200/80"
                    : "text-navy-600 hover:bg-slate-50 hover:text-navy-950"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-teal-600" : "text-navy-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Public Booking Link Badge */}
        <div className="p-3 mx-3 mb-3 rounded-xl bg-slate-50 border border-navy-200/80 text-xs">
          <span className="text-[10px] uppercase font-bold text-navy-500 block">
            Public Booking URL
          </span>
          <Link
            href={`/b/${activeBusinessSlug}`}
            target="_blank"
            className="mt-1 font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 text-[11px]"
          >
            <span>/b/{activeBusinessSlug}</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        {/* User Footer & Logout */}
        <div className="p-3 border-t border-navy-100 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
              RK
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-navy-900 block truncate">Rajesh Kumar</span>
              <span className="text-[10px] text-navy-500 uppercase font-semibold block">
                {activeBiz.role}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title={t.common.signOut}
            className="p-1.5 rounded-lg text-navy-400 hover:text-navy-900 hover:bg-navy-100 transition"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="hidden md:flex h-14 border-b border-navy-200/80 bg-white items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs text-navy-500">
            <span className="font-semibold text-navy-700">Active Business:</span>
            <span className="rounded-md bg-slate-100 border border-navy-200 px-2 py-0.5 font-bold text-navy-900">
              {activeBiz.name} ({activeBiz.city})
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ConnectivityIndicator />
            <LanguageSwitcher />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
