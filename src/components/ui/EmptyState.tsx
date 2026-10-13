import React from "react";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-navy-200 bg-white/60 p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-navy-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-navy-500">{description}</p>
      {(actionText && actionHref) && (
        <Link
          href={actionHref}
          className="mt-4 inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          {actionText}
        </Link>
      )}
      {(actionText && onAction) && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
