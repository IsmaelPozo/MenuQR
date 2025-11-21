"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { LanguageCode } from "./translations"

interface LanguageStore {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
}

export const useLanguage = create<LanguageStore>()(
  persist(
    (set) => ({
      language: "es",
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "app-language",
    },
  ),
)
