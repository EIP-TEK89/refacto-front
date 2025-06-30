import { Link } from "react-router-dom";
import { useAuthState } from "../store/auth/hooks";
import { useTranslation } from "react-i18next";

const Home = () => {
  const { isAuthenticated } = useAuthState();
  const { t } = useTranslation();

  return (
    <div className="container-card">
      <h1 className="text-2xl font-bold mb-4 text-[var(--color-blue)]">
        {t("home.title")}
      </h1>
      <p className="mb-6">{t("home.subtitle")}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {/* Feature Cards */}
        <div className="feature-card">
          <h2>Learn at Your Own Pace</h2>
          <p>Our bite-sized lessons make it easy to practice every day.</p>
        </div>

        <div className="feature-card">
          <h2>Track Your Progress</h2>
          <p>See your improvement over time with detailed statistics.</p>
        </div>

        <div className="feature-card">
          <h2>Join the Community</h2>
          <p>Connect with millions of learners from around the world.</p>
        </div>
      </div>

      <div className="mt-10 mb-6 text-center">
        <h3 className="text-xl font-bold mb-4 text-[var(--color-text-blue)]">
          Get Started Today
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
            Continue Your Learning Journey
          </h3>
          <p className="mb-4 text-[#38852e]">
            Pick up where you left off or start a new lesson
          </p>
          <Link to="/lessons" className="button-secondary inline-block">
            View All Lessons
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;
