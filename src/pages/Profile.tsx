import { useAuth } from "../store/auth";
import { useNavigate, Link } from "react-router-dom";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { useState, useEffect } from "react";
import PasswordChangeModal from "../components/PasswordChangeModal";
import DeleteAccountModal from "../components/DeleteAccountModal";
import LessonProgressDashboard from "../components/lessons/LessonProgressDashboard";
import LanguageDropdown from "../components/LanguageDropdown";
import { useTranslation } from "react-i18next";
import { getLessonProgress, getAllLessons } from "../services/lessonService";
import type { Lesson, LessonProgress } from "../types/lesson";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("stats");
  const { t } = useTranslation();
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Use the hook to protect this page
  useRequireAuth("/login");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressData, lessonsData] = await Promise.all([
          getLessonProgress(),
          getAllLessons(),
        ]);
        setLessonProgress(progressData);
      } catch (err) {
        console.error("Failed to fetch lesson progress:", err);
        setError("Failed to load your lesson progress");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const completedLessons = lessonProgress.filter(
    (p) => p.status === "COMPLETED"
  ).length;

  return (
    <div className="container-card">
      <h1 className="text-2xl font-bold mb-4 text-[var(--color-blue)]">
        {t("profile.title")}
      </h1>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <div className="bg-[var(--color-background-main)] p-6 rounded-2xl border border-[var(--color-border)] text-center">
            <div className="w-32 h-32 rounded-full bg-[var(--color-border)] mx-auto mb-4 flex items-center justify-center text-4xl">
              👤
            </div>
            <h2 className="text-xl font-bold mb-2">
              {user?.username || t("common.userName")}
            </h2>
            <p className="text-[var(--color-text-blue)]">
              {user?.firstName} {user?.lastName}
            </p>

            <div className="mt-6">
              <button className="button-secondary w-full mb-2">
                {t("profile.editProfile")}
              </button>
              <button
                onClick={handleLogout}
                className="button-primary w-full bg-[var(--color-red)] hover:bg-[var(--color-red-shadow)]"
              >
                {t("nav.logout")}
              </button>
            </div>
          </div>

          <div className="bg-[var(--color-background-main)] p-6 rounded-2xl border border-[var(--color-border)] mt-6">
            <div className="flex justify-center">
              <Link to="/lessons" className="button-primary w-full">
                {t("profile.continueLearning")}
              </Link>
            </div>
          </div>
        </div>

        <div className="md:w-2/3">
          {/* Tabs */}
          <div className="flex border-b border-[var(--color-border)] mb-6">
            <button
              onClick={() => setActiveTab("stats")}
              className={`px-4 py-2 font-medium ${
                activeTab === "stats"
                  ? "border-b-2 border-[var(--color-blue)] text-[var(--color-blue)]"
                  : "text-gray-500"
              }`}
            >
              {t("lessons.progress")}
            </button>
            <button
              onClick={() => setActiveTab("lessons")}
              className={`px-4 py-2 font-medium ${
                activeTab === "lessons"
                  ? "border-b-2 border-[var(--color-blue)] text-[var(--color-blue)]"
                  : "text-gray-500"
              }`}
            >
              {t("lessons.completed")}
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2 font-medium ${
                activeTab === "settings"
                  ? "border-b-2 border-[var(--color-blue)] text-[var(--color-blue)]"
                  : "text-gray-500"
              }`}
            >
              {t("common.settings")}
            </button>
          </div>

          {/* Stats Tab */}
          {activeTab === "stats" && (
            <div className="bg-[var(--color-background-main)] p-6 rounded-2xl border border-[var(--color-border)] mb-6">
              <h3 className="text-lg font-bold mb-4">{t("profile.tabs.progression.learningStatictics")}</h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-[var(--color-background-secondary)] rounded-xl">
                  <p className="text-sm opacity-70">{t("profile.tabs.progression.currentStreak")}</p>
                  <p className="text-2xl font-bold text-[var(--color-blue)]">
                    0 {t("profile.tabs.progression.days")}
                  </p>
                </div>

                <div className="p-4 bg-[var(--color-background-secondary)] rounded-xl">
                  <p className="text-sm opacity-70">{t("profile.tabs.progression.totalXP")}</p>
                  <p className="text-2xl font-bold text-[var(--color-blue)]">
                    0
                  </p>
                </div>

                <div className="p-4 bg-[var(--color-background-secondary)] rounded-xl">
                    <p className="text-sm opacity-70">{t("profile.tabs.progression.completedLessons")}</p>
                  <p className="text-2xl font-bold text-[var(--color-blue)]">
                    {completedLessons}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Lessons Progress Tab */}
          {activeTab === "lessons" && (
            <div className="bg-[var(--color-background-main)] p-6 rounded-2xl border border-[var(--color-border)] mb-6">
              <LessonProgressDashboard />
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="bg-[var(--color-background-main)] p-6 rounded-2xl border border-[var(--color-border)]">
              <h3 className="text-lg font-bold mb-4">
                {t("profile.accountSettings")}
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]">
                  <span>{t("profile.email")}</span>
                  <span className="text-[var(--color-text-blue)]">
                    {user?.email || "user@example.com"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]">
                  <span>{t("auth.password")}</span>
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="text-[var(--color-text-blue)] hover:text-[var(--color-text)]"
                  >
                    {t("profile.changePassword")}
                  </button>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]">
                  <span>{t("profile.notifications")}</span>
                  <button className="text-[var(--color-text-blue)] hover:text-[var(--color-text)]">
                    {t("profile.manage")}
                  </button>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]">
                  <span>{t("profile.language")}</span>
                  <div className="w-1/2">
                    <LanguageDropdown />
                  </div>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span>{t("profile.deleteAccount")}</span>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="text-[var(--color-red)] hover:text-[var(--color-red-shadow)]"
                  >
                    {t("profile.delete")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isPasswordModalOpen && (
        <PasswordChangeModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteAccountModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Profile;
