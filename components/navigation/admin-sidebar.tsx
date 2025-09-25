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
  LogOut,
  Settings,
  BarChart3,
  Bell,
  Palette
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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
  const { isMobile, setOpenMobile, setOpen } = useSidebar()

  const mainNavItems = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/reports/ongoing", label: "Ongoing Reports", icon: Flame },
    { href: "/admin/teams", label: "Teams", icon: Users },
    { href: "/admin/reports/resolved", label: "Resolved Reports", icon: CheckCircle },
    { href: "/admin/heatmap", label: "Heatmap", icon: Thermometer },
  ]

  const adminNavItems = [
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/settings", label: "Settings", icon: Settings },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
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

  const toggleSidebar = () => {
    setOpen(false)
  }

  return (
    <Sidebar className="bg-[#A3B18A] border-r border-[#8f9c7d]">
      <SidebarHeader className="border-b border-[#8f9c7d]">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 p-0 rounded-full hover:bg-[#8f9c7d]"
            onClick={toggleSidebar}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h2 className="text-lg font-bold">Admin Panel</h2>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/70">Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive(item.href)}
                      className={`hover:bg-[#8f9c7d] hover:text-gray-900 transition-all duration-200 rounded-xl ${
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

        <SidebarGroup>
          <SidebarGroupLabel className="text-white/70">Admin Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive(item.href)}
                      className={`hover:bg-[#8f9c7d] hover:text-gray-900 transition-all duration-200 rounded-xl ${
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
          <div className="text-sm font-medium p-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-[#8f9c7d] flex items-center justify-center">
                <User className="h-4 w-4 text-gray-800" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{admin.profile?.firstName || admin.username}</p>
                <p className="text-xs text-gray-700 mt-1">
                  {admin.profile?.position || "Municipal Staff"}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 text-gray-800 hover:bg-[#8f9c7d] hover:text-gray-900 rounded-xl"
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