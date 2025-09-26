"use client"

import type React from "react"

import { AdminAuthProvider, useAdminAuth } from "../../hooks/use-admin-auth"
import { AdminAuth } from "../../components/admin/admin-auth"
import { SidebarProvider, SidebarInset } from "../../components/ui/sidebar"
import { AdminSidebar } from "../../components/navigation/admin-sidebar"
import { Header } from "../../components/layout/header"

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, error } = useAdminAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminAuth />
  }

  // Show error message if there are authentication issues
  if (error) {
    console.error('Admin authentication error:', error)
  }

  return <>{children}</>
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <SidebarProvider defaultOpen={true}>
        <AdminSidebar />
        <SidebarInset>
          <Header />
          <AdminLayoutContent>{children}</AdminLayoutContent>
        </SidebarInset>
      </SidebarProvider>
    </AdminAuthProvider>
  )
}