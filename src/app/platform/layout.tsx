"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Building2,
  CreditCard,
  Activity,
  FileText,
  ArrowLeft,
  Wrench,
  AlertTriangle,
} from "lucide-react";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/platform/stats")
      .then((res) => {
        if (res.status === 403 || res.status === 401) {
          setIsAdmin(false);
        } else if (res.ok) {
          setIsAdmin(true);
        } else {
          // If in dev or unauthenticated, default to true for demonstration
          setIsAdmin(true);
        }
      })
      .catch(() => {
        setIsAdmin(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const navTabs = [
    { href: "/platform/businesses", label: "Registered Businesses", icon: Building2 },
    { href: "/platform/subscriptions", label: "Subscriptions", icon: CreditCard },
    { href: "/platform/operations", label: "Operations & Outbox", icon: Activity },
    { href: "/platform/audit", label: "Security & Audit Log", icon: FileText },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-xs font-semibold text-navy-500">Checking administrator authority...</div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-navy-900">
        <div className="max-w-md w-full bg-white rounded-2xl border border-navy-200/80 p-8 shadow-sm text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-200">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-navy-950">Platform Administrator Required</h2>
          <p className="text-xs text-navy-600 leading-relaxed">
            Your current account does not have platform-level administrative privileges. Public business registration grants business-owner authority for your individual workspace, not platform administration.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Business Workspace</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-navy-900">
      {/* Platform Header */}
      <header className="border-b border-navy-200/80 bg-navy-950 text-white sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500 text-navy-950 font-black">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-white block leading-tight">
                ServiceSaathi Platform
              </span>
              <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block">
                Super Admin Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-navy-200 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-navy-900 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Business Workspace</span>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center gap-2 overflow-x-auto border-t border-navy-800 pt-1">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                  active
                    ? "border-teal-400 text-teal-300"
                    : "border-transparent text-navy-300 hover:text-white hover:border-navy-600"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-4 sm:p-6 w-full flex-1">
        {children}
      </main>
    </div>
  );
}
