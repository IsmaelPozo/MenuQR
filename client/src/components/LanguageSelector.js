"use client"
import { useState, useRef, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { ChevronDown } from "lucide-react"

// Componentes SVG para las banderas - Bandera de España mejorada
const SpainFlag = () => (
  <svg width="20" height="15" viewBox="0 0 20 15" className="rounded-sm">
    <rect width="20" height="15" fill="#AA151B" />
    <rect width="20" height="9" y="3" fill="#F1BF00" />
    {/* Escudo simplificado */}
    <g transform="translate(6, 5)">
      <rect width="8" height="5" fill="#AA151B" stroke="#F1BF00" strokeWidth="0.3" />
      <rect width="2" height="5" x="1" fill="#F1BF00" />
      <rect width="2" height="5" x="3" fill="#AA151B" />
      <rect width="2" height="5" x="5" fill="#F1BF00" />
    </g>
  </svg>
)

const UKFlag = () => (
  <svg width="20" height="15" viewBox="0 0 20 15" className="rounded-sm">
    <rect width="20" height="15" fill="#012169" />
    <path d="M0,0 L20,15 M20,0 L0,15" stroke="#fff" strokeWidth="2" />
    <path d="M0,0 L20,15 M20,0 L0,15" stroke="#C8102E" strokeWidth="1" />
    <rect width="20" height="3" y="6" fill="#fff" />
    <rect width="3" height="15" x="8.5" fill="#fff" />
    <rect width="20" height="1" y="7" fill="#C8102E" />
    <rect width="1" height="15" x="9.5" fill="#C8102E" />
  </svg>
)

const FranceFlag = () => (
  <svg width="20" height="15" viewBox="0 0 20 15" className="rounded-sm">
    <rect width="20" height="15" fill="#fff" />
    <rect width="6.67" height="15" fill="#002395" />
    <rect width="6.67" height="15" x="13.33" fill="#ED2939" />
  </svg>
)

const GermanyFlag = () => (
  <svg width="20" height="15" viewBox="0 0 20 15" className="rounded-sm">
    <rect width="20" height="15" fill="#000" />
    <rect width="20" height="10" y="5" fill="#DD0000" />
    <rect width="20" height="5" y="10" fill="#FFCE00" />
  </svg>
)

const languages = [
  { code: "es", name: "Español", flag: <SpainFlag /> },
  { code: "en", name: "English", flag: <UKFlag /> },
  { code: "fr", name: "Français", flag: <FranceFlag /> },
  { code: "de", name: "Deutsch", flag: <GermanyFlag /> },
]

const LanguageSelector = () => {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode)
    setIsOpen(false)
  }

  return (
    <div className="language-selector-container" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="language-selector-button"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="language-selector-current">
          <div className="language-flag">{currentLanguage.flag}</div>
          <span className="language-name">{currentLanguage.name}</span>
        </div>
        <ChevronDown className={`language-chevron ${isOpen ? "rotated" : ""}`} />
      </button>

      {isOpen && (
        <div className="language-dropdown">
          <div className="language-dropdown-content">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`language-option ${currentLanguage.code === language.code ? "active" : ""}`}
              >
                <div className="language-flag">{language.flag}</div>
                <span className="language-name">{language.name}</span>
                {currentLanguage.code === language.code && <span className="language-check">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default LanguageSelector
