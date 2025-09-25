"use client"

import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
      <div className="w-full flex-1">
        {/* Removed redundant CivicPulse text to avoid duplication with sidebar */}
      </div>
    </header>
  )
}
