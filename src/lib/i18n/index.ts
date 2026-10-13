import en from "./dictionaries/en.json";
import ta from "./dictionaries/ta.json";

export type Locale = "en" | "ta";
export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = {
  en,
  ta: ta as unknown as Dictionary,
};

export function getDictionary(locale: Locale = "en"): Dictionary {
  return dictionaries[locale] || dictionaries.en;
}

/**
 * Format date in localized Indian locale format
 */
export function formatLocalDate(
  date: Date | string | number,
  locale: Locale = "en",
  options?: Intl.DateTimeFormatOptions
): string {
  const d = new Date(date);
  const loc = locale === "ta" ? "ta-IN" : "en-IN";
  return new Intl.DateTimeFormat(loc, options || {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Format time in localized Indian locale format
 */
export function formatLocalTime(
  date: Date | string | number,
  locale: Locale = "en"
): string {
  const d = new Date(date);
  const loc = locale === "ta" ? "ta-IN" : "en-IN";
  return new Intl.DateTimeFormat(loc, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}
