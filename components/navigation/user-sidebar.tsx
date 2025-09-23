"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { 
  Home, 
  MapPin, 
  Flame, 
  CheckCircle, 
  Thermometer,
  Menu,
  User,
  LogIn,
  UserPlus
} from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
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
  SidebarMenuAction,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useSidebar } from "@/components/ui/sidebar"

export function UserSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { t } = useTranslation()
  const { isMobile, setOpenMobile } = useSidebar()

  const navItems = [
    { href: "/", label: t("feed"), icon: Home },
    { href: "/map", label: t("inYourArea"), icon: MapPin },
    { href: "/reports/ongoing", label: t("ongoing"), icon: Flame },
    { href: "/reports/resolved", label: t("resolved"), icon: CheckCircle },
    { href: "/heatmap", label: t("heatmap"), icon: Thermometer },
  ]

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  const handleNavigation = (href: string) => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar className="bg-[#A3B18A] border-r border-[#8f9c7d]">
      <SidebarHeader className="border-b border-[#8f9c7d]">
        <div className="flex items-center gap-2">
          <Menu className="h-6 w-6" />
          <h2 className="text-xl font-bold">CivicSense</h2>
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
        {user ? (
          <div className="text-sm font-medium p-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <div>
                <p>User: {user.name}</p>
                <p className="text-xs text-gray-700 mt-1">Role: {user.role}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm font-medium p-2 space-y-2">
            <Link href="/login" onClick={() => isMobile && setOpenMobile(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2 text-gray-800 hover:bg-[#8f9c7d] hover:text-gray-900">
                <LogIn className="h-4 w-4" />
                <span>{t("signIn")}</span>
              </Button>
            </Link>
            <Link href="/register" onClick={() => isMobile && setOpenMobile(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2 text-gray-800 hover:bg-[#8f9c7d] hover:text-gray-900">
                <UserPlus className="h-4 w-4" />
                <span>{t("signUp")}</span>
              </Button>
            </Link>
            <div className="pt-2 border-t border-[#8f9c7d]">
              <p className="text-xs text-gray-700">Guest User</p>
            </div>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}