export const SUPPORTED_LANGUAGES = {
  es: { name: "Español", flag: "🇪🇸" },
  en: { name: "English", flag: "🇬🇧" },
  fr: { name: "Français", flag: "🇫🇷" },
  de: { name: "Deutsch", flag: "🇩🇪" },
  it: { name: "Italiano", flag: "🇮🇹" },
  pt: { name: "Português", flag: "🇵🇹" },
} as const

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES

export type TranslatedText = {
  [K in LanguageCode]?: string
}

export function getTranslation(
  translations: TranslatedText | string | null | undefined,
  language: LanguageCode,
  fallbackLanguage: LanguageCode = "es",
): string {
  // If it's a plain string (old format), return it
  if (typeof translations === "string") {
    return translations
  }

  // If it's null or undefined, return empty string
  if (!translations) {
    return ""
  }

  // Try to get the requested language
  if (translations[language]) {
    return translations[language]!
  }

  // Try fallback language
  if (translations[fallbackLanguage]) {
    return translations[fallbackLanguage]!
  }

  // Return first available translation
  const firstAvailable = Object.values(translations).find((t) => t)
  return firstAvailable || ""
}
