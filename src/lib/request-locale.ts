import { headers } from "next/headers";
import type { Locale } from "@/lib/i18n";

export async function getRequestLocale(): Promise<Locale> {
  const headerList = await headers();
  const acceptLanguage = headerList.get("accept-language") ?? "";

  return acceptLanguage.toLowerCase().startsWith("en") ? "en" : "tr";
}
