"use client"

import { ReportButton } from "./report-button"
import { useTranslation } from "@/lib/i18n"

export function LandingHero() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 md:pl-20">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 text-balance">{t("landing.title")}</h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto text-pretty">{t("landing.subtitle")}</p>
        </div>

        <div className="pt-8">
          <ReportButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-civic-primary rounded-full flex items-center justify-center mx-auto">
              <span className="text-white text-xl">📸</span>
            </div>
            <h3 className="font-semibold text-gray-900">{t("landing.features.photo.title")}</h3>
            <p className="text-gray-600 text-sm">{t("landing.features.photo.description")}</p>
          </div>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-civic-accent rounded-full flex items-center justify-center mx-auto">
              <span className="text-white text-xl">📍</span>
            </div>
            <h3 className="font-semibold text-gray-900">{t("landing.features.location.title")}</h3>
            <p className="text-gray-600 text-sm">{t("landing.features.location.description")}</p>
          </div>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-civic-primary rounded-full flex items-center justify-center mx-auto">
              <span className="text-white text-xl">✅</span>
            </div>
            <h3 className="font-semibold text-gray-900">{t("landing.features.updates.title")}</h3>
            <p className="text-gray-600 text-sm">{t("landing.features.updates.description")}</p>
          </div>
        </div>
      </div>
    </div>
  )
}