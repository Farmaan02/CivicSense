"use client"

import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n"
import { Globe } from "lucide-react"

export function LanguageToggle() {
  const { language, changeLanguage } = useTranslation()

  const toggleLanguage = () => {
    changeLanguage(language === "en" ? "hi" : "en")
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 text-muted-foreground hover:text-primary"
      title={language === "en" ? "Switch to Hindi" : "अंग्रेजी में बदलें"}
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium">{language === "en" ? "हिं" : "EN"}</span>
    </Button>
  )
}
