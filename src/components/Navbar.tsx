import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../store/auth";
import { useTranslation } from "react-i18next";

const Navigation = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="app-header">
      <Link to="/" className="flex items-center">
        <img src="/img/logo.ico" alt="Logo" className="app-logo" />
      </Link>
      <nav className="nav-links">
        <Link
          to="/"
          className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
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
            >
              {t("nav.lessons")}
            </Link>
            <Link
              to="/dictionary"
              className={`nav-link ${
                location.pathname.startsWith("/dictionary") ? "active" : ""
              }`}
            >
              {t("nav.dictionary")}
            </Link>
            <Link
              to="/ai-recognition"
              className={`nav-link ${
                location.pathname === "/ai-recognition" ? "active" : ""
              }`}
            >
              {t("nav.aiRecognition")}
            </Link>
            <Link
              to="/profile"
              className={`nav-link ${
                location.pathname === "/profile" ? "active" : ""
              }`}
            >
              {t("nav.profile")}
            </Link>
          </>
        )}
        {!isAuthenticated && (
          <Link to="/login" className="button-secondary">
            {t("nav.login")}
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Navigation;
