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
        className="bg-civic-primary hover:bg-civic-accent text-white px-12 py-6 text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
      >
        {t("landing.reportButton")}
      </Button>

      <ReportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
