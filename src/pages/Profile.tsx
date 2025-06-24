import { useAuth } from "../store/auth";
import { useNavigate, Link } from "react-router-dom";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { useState } from "react";
import PasswordChangeModal from "../components/PasswordChangeModal";
import LessonProgressDashboard from "../components/lessons/LessonProgressDashboard";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("stats");

  // Use the hook to protect this page
  useRequireAuth("/login");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="container-card">
      <h1 className="text-2xl font-bold mb-4 text-[var(--color-blue)]">
        Your Profile
      </h1>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <div className="bg-[var(--color-background-main)] p-6 rounded-2xl border border-[var(--color-border)] text-center">
            <div className="w-32 h-32 rounded-full bg-[var(--color-border)] mx-auto mb-4 flex items-center justify-center text-4xl">
              👤
            </div>
            <h2 className="text-xl font-bold mb-2">
              {user?.username || "User Name"}
            </h2>
            <p className="text-[var(--color-text-blue)]">
              {user?.firstName} {user?.lastName}
            </p>

            <div className="mt-6">
              <button className="button-secondary w-full mb-2">
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="button-primary w-full bg-[var(--color-red)] hover:bg-[var(--color-red-shadow)]"
              >
                Log Out
              </button>
            </div>
          </div>

          <div className="bg-[var(--color-background-main)] p-6 rounded-2xl border border-[var(--color-border)] mt-6">
            <div className="flex justify-center mb-4">
              <Link to="/lessons" className="button-primary w-full">
                Continue Learning
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
              Learning Stats
            </button>
            <button
              onClick={() => setActiveTab("lessons")}
              className={`px-4 py-2 font-medium ${
                activeTab === "lessons"
                  ? "border-b-2 border-[var(--color-blue)] text-[var(--color-blue)]"
                  : "text-gray-500"
              }`}
            >
              Lesson Progress
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2 font-medium ${
                activeTab === "settings"
                  ? "border-b-2 border-[var(--color-blue)] text-[var(--color-blue)]"
                  : "text-gray-500"
              }`}
            >
              Settings
            </button>
          </div>

          {/* Stats Tab */}
          {activeTab === "stats" && (
            <div className="bg-[var(--color-background-main)] p-6 rounded-2xl border border-[var(--color-border)] mb-6">
              <h3 className="text-lg font-bold mb-4">Learning Statistics</h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-[var(--color-background-secondary)] rounded-xl">
                  <p className="text-sm opacity-70">Current Streak</p>
                  <p className="text-2xl font-bold text-[var(--color-blue)]">
                    0 days
                  </p>
                </div>

                <div className="p-4 bg-[var(--color-background-secondary)] rounded-xl">
                  <p className="text-sm opacity-70">Total XP</p>
                  <p className="text-2xl font-bold text-[var(--color-blue)]">
                    0
                  </p>
                </div>

                <div className="p-4 bg-[var(--color-background-secondary)] rounded-xl">
                  <p className="text-sm opacity-70">Lessons Completed</p>
                  <p className="text-2xl font-bold text-[var(--color-blue)]">
                    0
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
              <h3 className="text-lg font-bold mb-4">Account Settings</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]">
                  <span>Email</span>
                  <span className="text-[var(--color-text-blue)]">
                    {user?.email || "user@example.com"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]">
                  <span>Password</span>
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="text-[var(--color-text-blue)] hover:text-[var(--color-text)]"
                  >
                    Change
                  </button>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]">
                  <span>Notifications</span>
                  <button className="text-[var(--color-text-blue)] hover:text-[var(--color-text)]">
                    Manage
                  </button>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]">
                  <span>Language</span>
                  <span className="text-[var(--color-text-blue)]">English</span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span>Delete Account</span>
                  <button className="text-[var(--color-red)] hover:text-[var(--color-red-shadow)]">
                    Delete
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
    </div>
  );
};

export default Profile;
