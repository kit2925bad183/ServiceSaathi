import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant: "neutral" | "brand" | "amber" | "emerald";
  };
}

export function StatCard({ title, value, subtitle, icon: Icon, badge }: StatCardProps) {
  const badgeClasses = {
    neutral: "bg-navy-100 text-navy-700",
    brand: "bg-brand-50 text-brand-700 border border-brand-200",
    amber: "bg-amber-50 text-amber-800 border border-amber-200",
    emerald: "bg-emerald-50 text-emerald-800 border border-emerald-200",
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-navy-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-navy-500">
          {title}
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-navy-950 font-sans">
          {value}
        </span>
        {badge && (
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              badgeClasses[badge.variant]
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-navy-500">{subtitle}</p>
      )}
    </div>
  );
}
