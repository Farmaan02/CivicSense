"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LanguageToggle } from "@/components/language-toggle"
import { CivicSenseSVGLogo } from "@/components/ui/svg-logo"
import { useTranslation } from "@/lib/i18n"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { t } = useTranslation()

  const navItems = [
    { href: "/", label: t("navigation.home"), icon: "🏠" },
    { href: "/report", label: t("navigation.reportIssue"), icon: "📋" },
    { href: "/forums", label: t("navigation.forums"), icon: "💬" },
    { href: "/events", label: t("navigation.events"), icon: "📅" },
    { href: "/voting", label: t("navigation.voting"), icon: "🗳️" },
    { href: "/map", label: t("navigation.map"), icon: "🗺️" },
    { href: "/about", label: t("navigation.about"), icon: "ℹ️" },
  ]

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <CivicSenseSVGLogo size={40} variant="horizontal" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive(item.href) ? "default" : "ghost"}
                  className={`flex items-center gap-2 ${
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <LanguageToggle />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">{t("navigation.dashboard")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">{t("navigation.profile")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>{t("navigation.signOut")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">{t("navigation.signIn")}</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">{t("navigation.signUp")}</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <span className="text-xl">{isMenuOpen ? "✕" : "☰"}</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <Card className="md:hidden absolute top-16 left-4 right-4 bg-white border shadow-lg z-50">
            <div className="p-4 space-y-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className={`w-full justify-start gap-3 ${
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Button>
                </Link>
              ))}
              {!user && (
                <>
                  <div className="border-t pt-2 mt-2">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        {t("navigation.signIn")}
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full justify-start mt-2">{t("navigation.signUp")}</Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </Card>
        )}
      </div>
    </nav>
  )
}
