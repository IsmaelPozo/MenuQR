"use server"

import { generateText } from "ai"
import { SUPPORTED_LANGUAGES, type LanguageCode, type TranslatedText } from "@/lib/languages"

export async function translateText(text: string, sourceLanguage: LanguageCode): Promise<TranslatedText> {
  if (!text || text.trim() === "") {
    return {}
  }

  const translations: TranslatedText = {
    [sourceLanguage]: text,
  }

  // Get all target languages (excluding source)
  const targetLanguages = Object.keys(SUPPORTED_LANGUAGES).filter((lang) => lang !== sourceLanguage) as LanguageCode[]

  try {
    // Translate to all languages in parallel
    const translationPromises = targetLanguages.map(async (targetLang) => {
      const prompt = `Translate the following restaurant menu text from ${SUPPORTED_LANGUAGES[sourceLanguage].name} to ${SUPPORTED_LANGUAGES[targetLang].name}. 
Only return the translation, nothing else. Keep the same tone and style appropriate for a restaurant menu.

Text to translate: ${text}`

      const { text: translatedText } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt,
        temperature: 0.3,
      })

      return { lang: targetLang, translation: translatedText.trim() }
    })

    const results = await Promise.all(translationPromises)

    // Add all translations to the object
    results.forEach(({ lang, translation }) => {
      translations[lang] = translation
    })

    return translations
  } catch (error) {
    console.error("[v0] Translation error:", error)
    // Return at least the source language
    return translations
  }
}

export async function translateMultipleFields(
  fields: Record<string, string>,
  sourceLanguage: LanguageCode,
): Promise<Record<string, TranslatedText>> {
  const results: Record<string, TranslatedText> = {}

  // Translate all fields in parallel
  const translationPromises = Object.entries(fields).map(async ([key, value]) => {
    const translations = await translateText(value, sourceLanguage)
    return { key, translations }
  })

  const allResults = await Promise.all(translationPromises)

  allResults.forEach(({ key, translations }) => {
    results[key] = translations
  })

  return results
}
