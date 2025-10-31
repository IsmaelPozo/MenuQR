"use client"
import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuth } from "../contexts/AuthContext"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"

const Login = () => {
  const { t } = useTranslation()
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const from = location.state?.from?.pathname || "/dashboard"

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate(from, { replace: true })
    return null
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = t("auth.emailRequired")
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email format is invalid"
    }

    if (!formData.password) {
      newErrors.password = t("auth.passwordRequired")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    const result = await login(formData.email, formData.password)

    if (result.success) {
      navigate(from, { replace: true })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">{t("auth.login")}</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="font-medium text-primary hover:text-primary-hover">
              {t("auth.register")}
            </Link>
          </p>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  {t("auth.email")}
                </label>
                <div className="input-with-icon">
                  <Mail className="input-icon-left" size={20} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`form-input ${errors.email ? "error" : ""}`}
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && <p className="error-message">{errors.email}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  {t("auth.password")}
                </label>
                <div className="input-with-icon has-right-icon">
                  <Lock className="input-icon-left" size={20} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className={`form-input ${errors.password ? "error" : ""}`}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button type="button" className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="error-message">{errors.password}</p>}
              </div>

              <div>
                <button type="submit" disabled={loading} className="btn btn-primary w-full">
                  {loading ? <div className="loading"></div> : t("auth.login")}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="text-center">
          <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-hover">
            {t("auth.forgotPassword")}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
