"use client"

import { useLanguage } from "./use-language"
import { getTranslation } from "./translations"

export function useTranslation() {
  const { language } = useLanguage() // Moved hook call to the top level
  try {
    return getTranslation(language)
  } catch (error) {
    // During SSR or build, return default Spanish translations
    return getTranslation("es")
  }
}
