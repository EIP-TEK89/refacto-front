import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../store/auth";

const Navigation = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

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
          Home
        </Link>
        <Link
          to="/lessons"
          className={`nav-link ${
            location.pathname.startsWith("/lessons") ? "active" : ""
          }`}
        >
          Lessons
        </Link>
        <Link
          to="/dictionary"
          className={`nav-link ${
            location.pathname.startsWith("/dictionary") ? "active" : ""
          }`}
        >
          Dictionary
        </Link>
        {isAuthenticated && (
          <Link
            to="/profile"
            className={`nav-link ${
              location.pathname === "/profile" ? "active" : ""
            }`}
          >
            Profile
          </Link>
        )}
        {!isAuthenticated && (
          <Link to="/login" className="button-secondary">
            Sign In
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Navigation;
