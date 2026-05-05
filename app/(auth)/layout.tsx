import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("common");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-full flex justify-end">
            <LanguageSwitcher compact />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-lg">
            DE
          </div>
          <p className="text-lg font-bold">{t("appName")}</p>
          <p className="text-xs text-muted-foreground">{t("appTagline")}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
