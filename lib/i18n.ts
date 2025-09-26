"use client"

import { useState, useEffect } from "react"

export type Language = "en" | "hi"

interface TranslationData {
  [key: string]: string | TranslationData
}

const translations: Record<Language, TranslationData> = {
  en: {},
  hi: {},
}

// Track loading state
let translationsLoaded = false
let loadingPromise: Promise<void> | null = null

// Load translations
const loadTranslations = async (): Promise<void> => {
  if (translationsLoaded) return
  
  if (loadingPromise) {
    return loadingPromise
  }
  
  loadingPromise = (async () => {
    try {
      const [enData, hiData] = await Promise.all([
        import("../i18n/en.json"),
        import("../i18n/hi.json")
      ])
      translations.en = enData.default
      translations.hi = hiData.default
      translationsLoaded = true
      console.log('[i18n] Translations loaded successfully')
    } catch (error) {
      console.error("Failed to load translations:", error)
    }
  })()
  
  return loadingPromise
}

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>("en")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const initializeTranslations = async () => {
      await loadTranslations()
      
      // Load saved language preference (only on client side)
      if (typeof window !== "undefined") {
        const savedLang = localStorage.getItem("civicpulse-language") as Language
        if (savedLang && (savedLang === "en" || savedLang === "hi")) {
          setLanguage(savedLang)
        }
      }
      setIsLoaded(true)
    }
    
    initializeTranslations()
  }, [])

  const changeLanguage = (lang: Language) => {
    setLanguage(lang)
    if (typeof window !== "undefined") {
      localStorage.setItem("civicpulse-language", lang)
      // Update document language attribute
      document.documentElement.lang = lang
    }
  }

  const t = (key: string, params?: Record<string, string | number>): string => {
    // Return key if translations aren't loaded yet
    if (!translationsLoaded || !isLoaded) {
      return key
    }
    
    const keys = key.split(".")
    let value: string | TranslationData = translations[language]

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        // Fallback to English if key not found in current language
        value = translations.en
        for (const fallbackKey of keys) {
          if (value && typeof value === "object" && fallbackKey in value) {
            value = value[fallbackKey]
          } else {
            console.warn(`Translation key not found: ${key}`)
            return key // Return the key itself as fallback
          }
        }
        break
      }
    }

    if (typeof value !== "string") {
      console.warn(`Translation value is not a string: ${key}`)
      return key
    }

    // Replace parameters in the translation
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match
      })
    }

    return value
  }

  return {
    t,
    language,
    changeLanguage,
    isLoaded,
    isRTL: false, // Hindi uses LTR, but this can be extended for RTL languages
  }
}

export const getStaticTranslation = async (key: string, lang: Language = "en"): Promise<string> => {
  await loadTranslations()
  
  const keys = key.split(".")
  let value: string | TranslationData = translations[lang]

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k]
    } else {
      return key
    }
  }

  return typeof value === "string" ? value : key
}
