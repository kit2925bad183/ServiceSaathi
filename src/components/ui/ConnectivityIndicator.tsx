"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { Wifi, WifiOff } from "lucide-react";

export function ConnectivityIndicator() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const { t } = useTranslation();

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Register service worker if supported
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("SW registration notice:", err);
      });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <Wifi className="h-3 w-3" />
        {t.common.online}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 border border-amber-300 shadow-sm animate-bounce">
      <WifiOff className="h-3 w-3 text-amber-800" />
      {t.common.offline}
    </span>
  );
}
