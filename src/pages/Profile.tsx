import { useAuth } from "../store/auth";
import { useNavigate } from "react-router-dom";
import { useRequireAuth } from "../hooks/useRequireAuth";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Use the hook to protect this page
  useRequireAuth("/login");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="container-card">
      <h1
        className="text-2xl font-bold mb-4 text-[var(--color-blue)]"
        style={{ marginBottom: "1rem" }}
      >
        Your Profile
      </h1>

      <div className="flex flex-col md:flex-row gap-8" style={{ gap: "2rem" }}>
        <div className="md:w-1/3">
          <div
            className="bg-[var(--color-background-main)] p-6 rounded-2xl border border-[var(--color-border)] text-center"
            style={{ padding: "1.5rem" }}
          >
            <div
              className="w-32 h-32 rounded-full bg-[var(--color-border)] mx-auto mb-4 flex items-center justify-center text-4xl"
              style={{
                marginBottom: "1rem",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              👤
            </div>
            <h2
              className="text-xl font-bold mb-2"
              style={{ marginBottom: "0.5rem" }}
            >
              {user?.username || "User Name"}
            </h2>
            <p className="text-[var(--color-text-blue)]">
              {user?.firstName} {user?.lastName}
            </p>

            <div className="mt-6" style={{ marginTop: "1.5rem" }}>
              <button
                className="button-secondary w-full mb-2"
                style={{ marginBottom: "0.5rem" }}
              >
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
        </div>

        <div className="md:w-2/3">
          <div
            className="bg-[var(--color-background-main)] p-6 rounded-2xl border border-[var(--color-border)] mb-6"
            style={{ marginBottom: "1.5rem" }}
          >
            <h3
              className="text-lg font-bold mb-4"
              style={{ marginBottom: "1rem" }}
            >
              Learning Statistics
            </h3>

            <div
              className="grid grid-cols-2 sm:grid-cols-3 gap-4"
              style={{ gap: "1rem" }}
            >
              <div
                className="p-4 bg-[var(--color-background-secondary)] rounded-xl"
                style={{ padding: "1rem" }}
              >
                <p className="text-sm opacity-70">Current Streak</p>
                <p className="text-2xl font-bold text-[var(--color-blue)]">
                  0 days
                </p>
              </div>

              <div
                className="p-4 bg-[var(--color-background-secondary)] rounded-xl"
                style={{ padding: "1rem" }}
              >
                <p className="text-sm opacity-70">Total XP</p>
                <p className="text-2xl font-bold text-[var(--color-blue)]">0</p>
              </div>

              <div
                className="p-4 bg-[var(--color-background-secondary)] rounded-xl"
                style={{ padding: "1rem" }}
              >
                <p className="text-sm opacity-70">Lessons Completed</p>
                <p className="text-2xl font-bold text-[var(--color-blue)]">0</p>
              </div>
            </div>
          </div>

          <div
            className="bg-[var(--color-background-main)] p-6 rounded-2xl border border-[var(--color-border)]"
            style={{ padding: "1.5rem" }}
          >
            <h3
              className="text-lg font-bold mb-4"
              style={{ marginBottom: "1rem" }}
            >
              Account Settings
            </h3>

            <div
              className="space-y-4"
              style={{ marginBlockStart: "1rem", marginBlockEnd: "1rem" }}
            >
              <div
                className="flex justify-between items-center py-2 border-b border-[var(--color-border)]"
                style={{ padding: "0.5rem 0" }}
              >
                <span>Email</span>
                <span className="text-[var(--color-text-blue)]">
                  {user?.email || "user@example.com"}
                </span>
              </div>

              <div
                className="flex justify-between items-center py-2 border-b border-[var(--color-border)]"
                style={{ padding: "0.5rem 0" }}
              >
                <span>Password</span>
                <button className="text-[var(--color-text-blue)] hover:text-[var(--color-text)]">
                  Change
                </button>
              </div>

              <div
                className="flex justify-between items-center py-2 border-b border-[var(--color-border)]"
                style={{ padding: "0.5rem 0" }}
              >
                <span>Notifications</span>
                <button className="text-[var(--color-text-blue)] hover:text-[var(--color-text)]">
                  Manage
                </button>
              </div>

              <div
                className="flex justify-between items-center py-2"
                style={{ padding: "0.5rem 0" }}
              >
                <span>Delete Account</span>
                <button className="text-[var(--color-red)] hover:text-[var(--color-red-shadow)]">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
