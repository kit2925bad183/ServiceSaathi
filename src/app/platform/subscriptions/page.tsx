"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface SubscriptionRecord {
  id: string;
  businessId: string;
  plan: string;
  status: string;
  billingCycle: string;
  currentPeriodEnd: string;
  business: {
    name: string;
    slug: string;
  };
}

export default function PlatformSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/platform/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.subscriptions) {
          setSubscriptions(data.subscriptions);
        } else {
          setSubscriptions([
            {
              id: "sub-1",
              businessId: "biz-1",
              plan: "GROWTH",
              status: "ACTIVE",
              billingCycle: "MONTHLY",
              currentPeriodEnd: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
              business: { name: "CoolBreeze Climate Solutions", slug: "coolbreeze" },
            },
            {
              id: "sub-2",
              businessId: "biz-2",
              plan: "STARTER",
              status: "TRIAL",
              billingCycle: "MONTHLY",
              currentPeriodEnd: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
              business: { name: "Apex Power & Appliance Care", slug: "apexcare" },
            },
          ]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-navy-200/80 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-navy-950">
            Tenant Subscriptions & Billing
          </h1>
          <p className="text-xs text-navy-500 mt-1">
            ServiceSaathi SaaS tiers, trial expiration periods, and active subscriber status.
          </p>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-2xl border border-navy-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-navy-800">
            <thead className="bg-slate-50 border-b border-navy-100 text-[11px] font-bold text-navy-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Business Workspace</th>
                <th className="px-5 py-3.5">Plan Tier</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Billing Cycle</th>
                <th className="px-5 py-3.5">Current Period End</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {subscriptions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-4">
                    <span className="font-bold text-navy-950 block">{s.business.name}</span>
                    <span className="text-[11px] text-navy-400 font-mono">/{s.business.slug}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-black text-xs font-mono bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-md">
                      {s.plan}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {s.status === "ACTIVE" ? (
                      <span className="inline-flex items-center gap-1 font-bold text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-[10px] text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                        <Clock className="h-3 w-3" />
                        TRIAL
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 font-medium text-navy-700">{s.billingCycle}</td>
                  <td className="px-5 py-4 text-navy-600 font-mono text-[11px]">
                    {new Date(s.currentPeriodEnd).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
