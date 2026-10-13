"use client";

import React, { useState } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { formatINR } from "@/lib/money";
import {
  Boxes,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  PlusCircle,
  Package,
  Layers,
  History,
} from "lucide-react";

export default function InventoryManagementPage() {
  const { t } = useTranslation();

  const [items, setItems] = useState([
    {
      id: "inv-1",
      name: "Copper Pipe 1/2 inch (Heavy Gauge)",
      sku: "AC-COP-50",
      category: "Piping",
      unit: "meters",
      unitCostPaise: 38000,
      sellingPricePaise: 48000,
      stockQuantity: 45,
      minStockThreshold: 10,
    },
    {
      id: "inv-2",
      name: "R32 Refrigerant Gas Cylinder (3kg)",
      sku: "AC-GAS-R32",
      category: "Refrigerant",
      unit: "kg",
      unitCostPaise: 85000,
      sellingPricePaise: 120000,
      stockQuantity: 12,
      minStockThreshold: 4,
    },
    {
      id: "inv-3",
      name: "Run Capacitor 50 MFD",
      sku: "AC-CAP-50",
      category: "Electrical",
      unit: "pcs",
      unitCostPaise: 16000,
      sellingPricePaise: 35000,
      stockQuantity: 28,
      minStockThreshold: 5,
    },
    {
      id: "inv-4",
      name: "AC Indoor Unit Drain Pipe (2 meters)",
      sku: "AC-DRN-02",
      category: "Accessories",
      unit: "pcs",
      unitCostPaise: 8000,
      sellingPricePaise: 18000,
      stockQuantity: 3,
      minStockThreshold: 5, // Low stock!
    },
  ]);

  const [movements] = useState([
    {
      id: "sm-1",
      item: "Run Capacitor 50 MFD",
      change: -1,
      type: "JOB_CONSUMPTION",
      reason: "Consumed on Job JOB-2026-1001 (Ananya Ramesh)",
      timestamp: "Today, 11:15 AM",
      actor: "Murugan Selvam",
    },
    {
      id: "sm-2",
      item: "R32 Refrigerant Gas Cylinder (3kg)",
      change: +10,
      type: "PURCHASE",
      reason: "Stock inward from National Gas Distributors",
      timestamp: "Yesterday",
      actor: "Rajesh Kumar",
    },
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-navy-200/80 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-navy-950">
            {t.common.inventory} & Stock Ledger
          </h1>
          <p className="text-xs text-navy-500 mt-1">
            Real-time materials tracking, warehouse stock levels, and automated job deductions.
          </p>
        </div>
      </div>

      {/* Inventory Items Table */}
      <div className="bg-white rounded-2xl border border-navy-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-navy-100 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-navy-950">
            Parts & Materials Stock List
          </h2>
          <span className="text-xs text-navy-500">{items.length} Tracked Items</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-50/70 text-navy-500 font-bold border-b border-navy-200/60 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Item Name & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">In Stock</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {items.map((item) => {
                const isLow = item.stockQuantity <= item.minStockThreshold;

                return (
                  <tr key={item.id} className="hover:bg-navy-50/40 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-navy-950 block">{item.name}</span>
                      <span className="font-mono text-[11px] text-navy-500">SKU: {item.sku}</span>
                    </td>
                    <td className="py-3.5 px-4 text-navy-600 font-medium">
                      {item.category}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-extrabold text-navy-950 text-sm">
                        {item.stockQuantity}
                      </span>{" "}
                      <span className="text-navy-400 text-[11px]">{item.unit}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-navy-950">
                      {formatINR(item.sellingPricePaise)}
                    </td>
                    <td className="py-3.5 px-4">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-300">
                          <AlertTriangle className="h-3 w-3 text-amber-600" />
                          Low Stock (≤ {item.minStockThreshold})
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                          In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Movement Audit Ledger */}
      <div className="bg-white rounded-2xl border border-navy-200/80 p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 border-b border-navy-100 pb-3">
          <History className="h-4 w-4 text-brand-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-navy-950">
            Stock Ledger & Job Deductions
          </h2>
        </div>

        <div className="divide-y divide-navy-100">
          {movements.map((m) => (
            <div key={m.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-navy-900 block">{m.item}</span>
                <span className="text-navy-500 text-[11px] block">{m.reason}</span>
                <span className="text-navy-400 text-[10px] mt-0.5 block">
                  By {m.actor} • {m.timestamp}
                </span>
              </div>

              <div className="text-right">
                <span
                  className={`font-black text-sm block ${
                    m.change < 0 ? "text-amber-700" : "text-emerald-700"
                  }`}
                >
                  {m.change > 0 ? `+${m.change}` : m.change}
                </span>
                <span className="text-[10px] uppercase font-bold text-navy-400">
                  {m.type.replace("_", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
