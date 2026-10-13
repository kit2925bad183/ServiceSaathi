"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ConnectivityIndicator } from "@/components/ui/ConnectivityIndicator";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import {
  Wrench,
  Calendar,
  Briefcase,
  User,
  LogOut,
  ArrowLeft,
  Smartphone,
} from "lucide-react";

export default function TechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
    }
  };

  const tabs = [
    { href: "/technician/today", label: "Today", icon: Calendar },
    { href: "/technician/jobs", label: "All Jobs", icon: Briefcase },
    { href: "/technician/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-navy-900 pb-20 sm:pb-0">
      {/* Mobile-First Header */}
      <header className="sticky top-0 z-40 bg-navy-950 text-white px-4 py-3 border-b border-navy-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 text-navy-950 font-bold">
            <Wrench className="h-4 w-4" />
          </div>
          <div>
            <span className="text-sm font-black text-white block leading-tight">
              ServiceSaathi Field
            </span>
            <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block">
              Technician Workspace
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ConnectivityIndicator />
          <LanguageSwitcher />
          <Link
            href="/dashboard"
            className="text-[11px] font-semibold text-navy-300 hover:text-white px-2 py-1 rounded bg-navy-900 border border-navy-700 hidden sm:inline-block"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-lg mx-auto w-full p-4 sm:p-6">{children}</main>

      {/* Mobile Sticky Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-navy-200 py-1.5 px-6 flex items-center justify-around sm:hidden shadow-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-bold transition ${
                active ? "text-teal-600 font-black" : "text-navy-500 hover:text-navy-900"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-teal-600" : "text-navy-400"}`} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
