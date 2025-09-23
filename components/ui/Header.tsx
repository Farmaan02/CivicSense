"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Bell, User } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  onMenuClick?: () => void
  className?: string
  actions?: React.ReactNode
  userMenu?: React.ReactNode
}

const Header = React.forwardRef<HTMLDivElement, HeaderProps>(
  ({ title, onMenuClick, className, actions, userMenu, ...props }, ref) => {
    const isMobile = useIsMobile()

    return (
      <header
        ref={ref}
        className={cn(
          "sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6",
          className
        )}
        {...props}
      >
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                onClick={onMenuClick}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              {userMenu}
            </SheetContent>
          </Sheet>
        )}
        
        <div className="w-full flex-1">
          <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {actions}
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
            <span className="sr-only">User menu</span>
          </Button>
        </div>
      </header>
    )
  }
)
Header.displayName = "Header"

export { Header }