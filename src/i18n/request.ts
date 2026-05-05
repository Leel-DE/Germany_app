import { getRequestConfig } from "next-intl/server";
import { getLocaleFromCookie, getMessages } from "@/src/i18n/server";

export default getRequestConfig(async () => {
  const locale = await getLocaleFromCookie();

  return {
    locale,
    messages: getMessages(locale),
  };
});
