"use client"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuth } from "../contexts/AuthContext"
import { LayoutDashboard, Menu, QrCode, ChefHat, LogOut } from "lucide-react"
import LanguageSelector from "./LanguageSelector"

const Navbar = () => {
  const { t } = useTranslation()
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const isActive = (path) => location.pathname === path

  const isLoginPage = location.pathname === "/login"
  const isRegisterPage = location.pathname === "/register"

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center transition-transform hover:scale-105">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/android-chrome-192x192-YBhqxjFwV2dkqdtI0AeAQx5Ma9VeIA.png"
              alt="QR Menu - Sistema de Menú Digital para Restaurantes"
              className="w-10 h-10 object-contain"
            />
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/dashboard") ? "bg-primary-light text-primary" : "text-gray-600 hover:text-primary"
                  }`}
                >
                  <LayoutDashboard size={16} />
                  {t("navigation.dashboard")}
                </Link>

                <Link
                  to="/menu-management"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/menu-management") ? "bg-primary-light text-primary" : "text-gray-600 hover:text-primary"
                  }`}
                >
                  <Menu size={16} />
                  {t("navigation.menu")}
                </Link>

                <Link
                  to="/tables"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/tables") ? "bg-primary-light text-primary" : "text-gray-600 hover:text-primary"
                  }`}
                >
                  <QrCode size={16} />
                  {t("navigation.tables")}
                </Link>

                <Link
                  to="/kitchen"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/kitchen") ? "bg-primary-light text-primary" : "text-gray-600 hover:text-primary"
                  }`}
                >
                  <ChefHat size={16} />
                  {t("navigation.kitchen")}
                </Link>
              </>
            ) : null}

            {/* Language Selector */}
            <LanguageSelector />

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 hidden sm:inline">{user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">{t("auth.logout")}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {!isLoginPage && (
                  <Link to="/login" className="btn btn-secondary">
                    {t("auth.login")}
                  </Link>
                )}
                {!isRegisterPage && (
                  <Link to="/register" className="btn btn-primary">
                    {t("auth.register")}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
