"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ReportForm } from "./report-form"

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ReportModal({ isOpen, onClose }: ReportModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-civic-primary text-center">Report an Issue</DialogTitle>
        </DialogHeader>
        <ReportForm onClose={onClose} />
      </DialogContent>
    </Dialog>
  )
}
