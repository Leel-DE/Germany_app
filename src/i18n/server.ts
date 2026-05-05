import { cookies } from "next/headers";
import en from "@/src/i18n/locales/en.json";
import de from "@/src/i18n/locales/de.json";
import ru from "@/src/i18n/locales/ru.json";
import uk from "@/src/i18n/locales/uk.json";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE_NAME, type AppLocale } from "@/src/i18n";

const MESSAGES = {
  en,
  de,
  ru,
  uk,
} as const;

export async function getLocaleFromCookie(): Promise<AppLocale> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  return raw && isLocale(raw) ? raw : DEFAULT_LOCALE;
}

export function getMessages(locale: AppLocale) {
  return MESSAGES[locale];
}
