"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { 
  Home, 
  Flame, 
  Users, 
  CheckCircle, 
  Thermometer,
  Menu,
  User,
  LogOut
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export function AdminSidebar() {
  const pathname = usePathname()
  const { admin, logout } = useAdminAuth()
  const { isMobile, setOpenMobile } = useSidebar()

  const navItems = [
    { href: "/admin", label: "Feed", icon: Home },
    { href: "/admin/reports/ongoing", label: "Ongoing", icon: Flame },
    { href: "/admin/teams", label: "Teams", icon: Users },
    { href: "/admin/reports/resolved", label: "Resolved", icon: CheckCircle },
    { href: "/admin/heatmap", label: "Heatmap", icon: Thermometer },
  ]

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin"
    }
    return pathname.startsWith(href)
  }

  const handleNavigation = (href: string) => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const handleLogout = () => {
    logout()
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar className="bg-[#A3B18A] border-r border-[#8f9c7d]">
      <SidebarHeader className="border-b border-[#8f9c7d]">
        <div className="flex items-center gap-2">
          <Menu className="h-6 w-6" />
          <h2 className="text-xl font-bold">CivicSense Admin</h2>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive(item.href)}
                      className={`hover:bg-[#8f9c7d] hover:text-gray-900 ${
                        isActive(item.href)
                          ? "bg-[#8f9c7d] text-gray-900 font-semibold"
                          : "text-gray-800"
                      }`}
                    >
                      <Link href={item.href} onClick={() => handleNavigation(item.href)}>
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-[#8f9c7d] mt-auto">
        {admin ? (
          <div className="text-sm font-medium p-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <div>
                <p>Admin: {admin.profile?.firstName || admin.username}</p>
                <p className="text-xs text-gray-700 mt-1">
                  Dept: {admin.profile?.position || "Municipal Staff"}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 mt-2 text-gray-800 hover:bg-[#8f9c7d] hover:text-gray-900"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        ) : (
          <div className="text-sm font-medium p-2">
            <p>Admin User</p>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}