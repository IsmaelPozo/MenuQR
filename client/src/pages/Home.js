"use client"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuth } from "../contexts/AuthContext"
import { QrCode, Globe, Clock, CreditCard, ArrowRight } from "lucide-react"

const Home = () => {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()

  const features = [
    {
      icon: <QrCode className="w-8 h-8 text-primary" />,
      title: t("home.features.qr"),
      description: "Cada mesa tiene su código QR único para acceso directo al menú",
    },
    {
      icon: <Globe className="w-8 h-8 text-primary" />,
      title: t("home.features.multilang"),
      description: "Menús disponibles en español, inglés, francés y alemán",
    },
    {
      icon: <Clock className="w-8 h-8 text-primary" />,
      title: t("home.features.realtime"),
      description: "Los pedidos llegan instantáneamente a la cocina",
    },
    {
      icon: <CreditCard className="w-8 h-8 text-primary" />,
      title: t("home.features.payment"),
      description: "Gestión flexible de pagos individuales o por mesa",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-hover text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{t("home.title")}</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">{t("home.subtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-secondary btn-lg">
                  Ir al Dashboard
                  <ArrowRight size={20} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-secondary btn-lg">
                    {t("home.getStarted")}
                    <ArrowRight size={20} />
                  </Link>
                  <Link to="/login" className="btn btn-primary btn-lg border-2 border-white/20">
                    {t("auth.login")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Características Principales</h2>
              <p className="text-xl text-secondary max-w-2xl mx-auto">
                Todo lo que necesitas para modernizar tu restaurante y mejorar la experiencia de tus clientes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="card text-center">
                  <div className="card-body">
                    <div className="flex justify-center mb-4">{feature.icon}</div>
                    <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                    <p className="text-secondary">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">¿Cómo Funciona?</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Configura tu Menú</h3>
                <p className="text-secondary">Añade tus platos, precios y descripciones en múltiples idiomas</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Genera Códigos QR</h3>
                <p className="text-secondary">Crea códigos QR únicos para cada mesa e imprímelos</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Recibe Pedidos</h3>
                <p className="text-secondary">Los clientes escanean, piden y los pedidos llegan a tu cocina</p>
              </div>
            </div>

            {!isAuthenticated && (
              <Link to="/register" className="btn btn-primary btn-lg">
                Comenzar Gratis
                <ArrowRight size={20} />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
