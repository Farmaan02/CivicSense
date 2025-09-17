import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { Navigation } from "@/components/navigation/navigation"
import { AuthProvider } from "@/lib/auth"
import { NotificationProvider } from "@/components/notifications/notification-provider"
import { Suspense } from "react"
import Script from "next/script"
import "./globals.css"

export const metadata: Metadata = {
  title: "CivicSense - Report Community Issues",
  description: "Help make your neighborhood better by reporting problems that need attention",
  generator: "CivicSense",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Maps JavaScript API - Only load if API key is available */}
        {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && 
         process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY !== 'PLACEHOLDER_API_KEY' && (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,visualization`}
            strategy="beforeInteractive"
            onError={(e) => {
              console.warn('Google Maps API failed to load:', e)
            }}
          />
        )}
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <NotificationProvider>
            <Suspense fallback={null}>
              <Navigation />
              {children}
              <Toaster />
            </Suspense>
          </NotificationProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
