export const LOCALES = ["en", "de", "ru", "uk"] as const;
export type AppLocale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en";
export const LOCALE_COOKIE_NAME = "app-locale";

export const LANGUAGE_OPTIONS: Array<{ locale: AppLocale; label: string; flag: string }> = [
  { locale: "en", label: "English", flag: "🇬🇧" },
  { locale: "de", label: "Deutsch", flag: "🇩🇪" },
  { locale: "ru", label: "Русский", flag: "🏳️" },
  { locale: "uk", label: "Українська", flag: "🇺🇦" },
];

export function isLocale(value: string): value is AppLocale {
  return LOCALES.includes(value as AppLocale);
}
