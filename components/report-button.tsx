"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ReportModal } from "./report-modal/report-modal"
import { useTranslation } from "@/lib/i18n"

export function ReportButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="civic-button bg-gradient-to-r from-civic-primary to-civic-accent hover:from-civic-accent hover:to-civic-primary text-white px-8 py-6 text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
      >
        <span className="relative z-10">{t("landing.reportButton")}</span>
        <span className="absolute inset-0 bg-white/20 rounded-xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
      </Button>

      <ReportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}