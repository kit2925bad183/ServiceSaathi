"use client";

import React from "react";
import { useTranslation } from "@/lib/i18n/context";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200 bg-white px-2.5 py-1.5 text-xs font-medium text-navy-700 shadow-sm transition hover:bg-navy-50">
      <Languages className="h-3.5 w-3.5 text-brand-600" />
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as "en" | "ta")}
        aria-label={t.common.language}
        className="cursor-pointer bg-transparent font-medium text-navy-800 outline-none"
      >
        <option value="en">English</option>
        <option value="ta">தமிழ் (Tamil)</option>
      </select>
    </div>
  );
}
