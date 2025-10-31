import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

import es from "./locales/es.json"
import en from "./locales/en.json"
import fr from "./locales/fr.json"
import de from "./locales/de.json"

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
      fr: { translation: fr },
      de: { translation: de },
    },
    fallbackLng: "es",
    debug: process.env.NODE_ENV === "development",

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ["querystring", "localStorage", "navigator"],
      lookupQuerystring: "lang",
      lookupLocalStorage: "language",
      caches: ["localStorage"],
    },
  })

export default i18n
