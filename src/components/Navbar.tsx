import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../store/auth";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

const Navigation = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Gestionnaire pour l'ouverture/fermeture du menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Fermer le menu si on clique sur un lien
  const closeMenu = () => {
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  // Gestionnaire de redimensionnement pour détecter les changements de taille d'écran
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <header className="app-header">
      <Link to="/" className="flex items-center">
        <img src="/img/logo.ico" alt="Logo" className="app-logo" />
      </Link>

      {/* Bouton burger pour mobile */}
      <button
        className={`burger-menu ${isMobile ? "visible" : "hidden"}`}
        onClick={toggleMenu}
        aria-label="Menu"
        aria-expanded={isMenuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav
        className={`nav-links ${
          isMobile
            ? isMenuOpen
              ? "mobile-menu-open"
              : "mobile-menu-closed"
            : ""
        }`}
      >
        <Link
          to="/"
          className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
          onClick={closeMenu}
        >
          {t("nav.home")}
        </Link>
        {isAuthenticated && (
          <>
            <Link
              to="/lessons"
              className={`nav-link ${
                location.pathname.startsWith("/lessons") ? "active" : ""
              }`}
              onClick={closeMenu}
            >
              {t("nav.lessons")}
            </Link>
            <Link
              to="/dictionary"
              className={`nav-link ${
                location.pathname.startsWith("/dictionary") ? "active" : ""
              }`}
              onClick={closeMenu}
            >
              {t("nav.dictionary")}
            </Link>
            <Link
              to="/ai-recognition"
              className={`nav-link ${
                location.pathname === "/ai-recognition" ? "active" : ""
              }`}
              onClick={closeMenu}
            >
              {t("nav.aiRecognition")}
            </Link>
            <Link
              to="/profile"
              className={`nav-link ${
                location.pathname === "/profile" ? "active" : ""
              }`}
              onClick={closeMenu}
            >
              {t("nav.profile")}
            </Link>
          </>
        )}
        {!isAuthenticated && (
          <Link to="/login" className="button-secondary" onClick={closeMenu}>
            {t("nav.login")}
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Navigation;
