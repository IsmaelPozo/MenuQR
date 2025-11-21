"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Moon, Sun, Languages, QrCode, Monitor, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/lib/languages"
import { useLanguage } from "@/lib/i18n/use-language"
import { useTranslation } from "@/lib/i18n/use-translation"

interface AppHeaderProps {
  title?: string
  showLanguageSelector?: boolean
}

export function AppHeader({ title = "QR Menu", showLanguageSelector = true }: AppHeaderProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { language, setLanguage } = useLanguage()
  const t = useTranslation()
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setMounted(true)
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check", { credentials: "include" })
        setIsLoggedIn(response.ok)
      } catch {
        setIsLoggedIn(false)
      }
    }
    checkAuth()
  }, [])

  const handleLanguageChange = (lang: LanguageCode) => {
    setLanguage(lang)
    window.location.reload()
  }

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme)
  }

  const isAuthPage = pathname?.startsWith("/auth")
  const isAdminPage = pathname?.startsWith("/admin")

  if (!t || !t.theme) {
    return (
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {isLoggedIn ? (
            <Link href="/admin" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <QrCode className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">{title}</h1>
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <QrCode className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">{title}</h1>
            </Link>
          )}
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {isLoggedIn ? (
          <Link href="/admin" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <QrCode className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">{title}</h1>
          </Link>
        ) : (
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <QrCode className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">{title}</h1>
          </Link>
        )}

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          {showLanguageSelector && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" title={t.common?.language || "Change language"}>
                  <Languages className="h-5 w-5" />
                  <span className="sr-only">{t.common?.language}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
                  <DropdownMenuItem
                    key={code}
                    onClick={() => handleLanguageChange(code as LanguageCode)}
                    className={language === code ? "bg-accent" : ""}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Theme Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" title={t.theme?.light || "Change theme"}>
                {mounted && (
                  <>
                    {theme === "light" && <Sun className="h-5 w-5" />}
                    {theme === "dark" && <Moon className="h-5 w-5" />}
                    {theme === "system" && <Monitor className="h-5 w-5" />}
                  </>
                )}
                {!mounted && <Sun className="h-5 w-5" />}
                <span className="sr-only">{t.theme?.light}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleThemeChange("light")}>
                <Sun className="mr-2 h-4 w-4" />
                {t.theme.light}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                {t.theme.dark}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange("system")}>
                <Monitor className="mr-2 h-4 w-4" />
                {t.theme.system}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {mounted && (
            <>
              {isLoggedIn ? (
                <form action="/api/auth/logout" method="post" className="inline">
                  <Button type="submit" variant="outline" size="icon" title={t.auth.logout}>
                    <LogOut className="h-5 w-5" />
                    <span className="sr-only">{t.auth.logout}</span>
                  </Button>
                </form>
              ) : (
                !isAuthPage &&
                !isAdminPage &&
                t.auth && (
                  <>
                    <Button variant="ghost" asChild>
                      <Link href="/auth/login">{t.auth.login}</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/auth/register">{t.auth.getStarted}</Link>
                    </Button>
                  </>
                )
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
