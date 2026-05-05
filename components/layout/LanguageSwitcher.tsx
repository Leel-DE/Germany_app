"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { LANGUAGE_OPTIONS, LOCALE_COOKIE_NAME, type AppLocale } from "@/src/i18n";
import { useTranslations } from "next-intl";

interface LanguageSwitcherProps {
  compact?: boolean;
}

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const tCommon = useTranslations("common");

  function setLocale(nextLocale: AppLocale) {
    document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      {!compact ? <span>{tCommon("language")}</span> : null}
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as AppLocale)}
        className="h-9 rounded-md border border-border bg-background px-2 text-sm text-foreground"
        aria-label={tCommon("language")}
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <option key={option.locale} value={option.locale}>
            {option.flag} {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
