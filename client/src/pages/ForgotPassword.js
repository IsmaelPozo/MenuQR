"use client"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Mail, ArrowLeft } from "lucide-react"
import toast from "react-hot-toast"

const ForgotPassword = () => {
  const { t } = useTranslation()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email) {
      toast.error("Por favor ingresa tu correo electrónico")
      return
    }

    setLoading(true)

    // Simular envío de email (aquí implementarías la lógica real)
    setTimeout(() => {
      setSent(true)
      setLoading(false)
      toast.success("Se ha enviado un enlace de recuperación a tu correo")
    }, 2000)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Correo Enviado</h2>
            <p className="text-gray-600 mb-6">
              Hemos enviado un enlace de recuperación a <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
            </p>
            <Link to="/login" className="btn btn-primary">
              <ArrowLeft size={16} />
              Volver al Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Recuperar Contraseña</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="form-input pl-10"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <button type="submit" disabled={loading} className="btn btn-primary w-full">
                  {loading ? <div className="loading"></div> : "Enviar Enlace de Recuperación"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/login"
            className="text-sm text-primary hover:text-primary-hover flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Volver al Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
