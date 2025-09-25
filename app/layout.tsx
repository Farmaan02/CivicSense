import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth"
import { NotificationProvider } from "@/components/notifications/notification-provider"
import { Suspense } from "react"
import Script from "next/script"
import "./globals.css"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { UserSidebar } from "@/components/navigation/user-sidebar"
import { Header } from "@/components/layout/header"

export const metadata: Metadata = {
  title: "CivicPulse - Report Community Issues",
  description: "Help make your neighborhood better by reporting problems that need attention",
  generator: "CivicPulse",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const hasValidGoogleMapsKey = 
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && 
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY !== 'PLACEHOLDER_API_KEY' &&
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY_HERE'

  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {/* Skip to main content link for accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        
        {/* Google Maps JavaScript API - Only load if API key is available */}
        {hasValidGoogleMapsKey && (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,visualization`}
            strategy="beforeInteractive"
          />
        )}
        <AuthProvider>
          <NotificationProvider>
            <SidebarProvider defaultOpen={true}>
              <UserSidebar />
              <SidebarInset>
                <Header />
                <Suspense fallback={null}>
                  <main id="main-content" className="flex-1">
                    {children}
                  </main>
                  <Toaster />
                </Suspense>
              </SidebarInset>
            </SidebarProvider>
          </NotificationProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}