"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
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
  SidebarRail,
} from "@/components/ui/sidebar"
import { useSidebar } from "@/components/ui/sidebar"
import { 
  Home, 
  MapPin, 
  Camera, 
  MessageSquare, 
  Calendar, 
  Settings, 
  LogOut, 
  Menu,
  BarChart3,
  Palette
} from "lucide-react"
import { useAuth } from "@/lib/auth"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Report Issue",
    url: "/report",
    icon: Camera,
  },
  {
    title: "Map View",
    url: "/map",
    icon: MapPin,
  },
  {
    title: "Forums",
    url: "/forums",
    icon: MessageSquare,
  },
  {
    title: "Events",
    url: "/events",
    icon: Calendar,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
]

export function UserSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const { setOpen } = useSidebar()
  
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
          <h2 className="text-lg font-bold">CivicPulse</h2>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#3A4750]">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url}
                    className="hover:bg-[#8f9c7d] data-[active=true]:bg-[#8f9c7d]"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              className="hover:bg-[#8f9c7d]"
              onClick={logout}
            >
              <button>
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      <SidebarRail className="bg-[#8f9c7d]" />
    </Sidebar>
  )
}