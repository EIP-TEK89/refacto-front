import { Link } from "react-router-dom";
import { useAuthState } from "../store/auth/hooks";
import { useTranslation } from "react-i18next";
import HomeLanguageDropdown from "../components/HomeLanguageDropdown";

const Home = () => {
  const { isAuthenticated } = useAuthState();
  const { t } = useTranslation();

  return (
    <div className="container-card relative">
      <div className="home-language-container">
        <HomeLanguageDropdown />
      </div>
      <div className="home-content">
        <h1 className="text-2xl font-bold mb-4 text-[var(--color-blue)]">
          {t("home.title")}
        </h1>
        <p className="mb-6">{t("home.subtitle")}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {/* Feature Cards */}
          <div className="feature-card">
            <h2>{t("home.features.pace.title")}</h2>
            <p>{t("home.features.pace.description")}</p>
          </div>

          <div className="feature-card">
            <h2>{t("home.features.progress.title")}</h2>
            <p>{t("home.features.progress.description")}</p>
          </div>

          <div className="feature-card">
            <h2>{t("home.features.community.title")}</h2>
            <p>{t("home.features.community.description")}</p>
          </div>
        </div>

        <div className="mt-10 mb-6 text-center">
          <h3 className="text-xl font-bold mb-4 text-[var(--color-text-blue)]">
            {t("home.getStarted")}
          </h3>
          <Link
            to={isAuthenticated ? "/lessons" : "/signup"}
            className="button-primary inline-block px-8 py-3"
          >
            {isAuthenticated ? t("home.cta") : t("auth.signup")}
          </Link>
        </div>

        {isAuthenticated && (
          <div className="mt-4 bg-blue-50 p-6 rounded-xl text-center">
            <h3 className="font-bold text-lg mb-2 text-[#58cc02]">
              {t("home.continue.title")}
            </h3>
            <p className="mb-4 text-[#38852e]">
              {t("home.continue.description")}
            </p>
            <Link to="/lessons" className="button-secondary inline-block">
              {t("home.viewLessons")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
