"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Locale, Dictionary, getDictionary } from "./index";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("servicesaathi_locale") as Locale;
    if (saved === "en" || saved === "ta") {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("servicesaathi_locale", newLocale);
    document.documentElement.lang = newLocale;
  };

  const t = getDictionary(locale);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      locale: "en" as Locale,
      setLocale: () => {},
      t: getDictionary("en"),
    };
  }
  return context;
}
