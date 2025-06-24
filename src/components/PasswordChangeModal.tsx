import { useState } from "react";
import { useAuth } from "../store/auth";

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PasswordChangeModal = ({ isOpen, onClose }: PasswordChangeModalProps) => {
  const { user, updateUser, error } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccess(false);

    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setLocalError("All fields are required");
      return;
    }

    // Password confirmation check
    if (newPassword !== confirmPassword) {
      setLocalError("New passwords don't match");
      return;
    }

    // Password strength validation
    if (newPassword.length < 8) {
      setLocalError("New password must be at least 8 characters long");
      return;
    }

    // Prevent setting the same password
    if (currentPassword === newPassword) {
      setLocalError("New password must be different from the current one");
      return;
    }

    setIsLoading(true);

    try {
      if (user) {
        await updateUser(user.id, {
          password: currentPassword,
          newPassword: newPassword,
        });

        // Reset form fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // Show success message
        setSuccess(true);

        // Close modal after delay
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);
      }
    } catch (err) {
      // Error is handled by auth context and displayed via the error prop
      console.error("Failed to change password:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[var(--color-background-main)] rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Change Password</h2>
          <button onClick={onClose} className="text-xl" aria-label="Close">
            &times;
          </button>
        </div>

        {success ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Password changed successfully!
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {(localError || error) && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {localError || error}
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="current-password"
                className="block mb-2 text-sm font-medium"
              >
                Current Password
              </label>
              <div className="relative">
                <input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-2 border border-[var(--color-border)] rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  {showCurrentPassword ? (
                    <img
                      src="/icons/visibility.svg"
                      alt="Hide password"
                      className="w-5 h-5"
                    />
                  ) : (
                    <img
                      src="/icons/visibility_off.svg"
                      alt="Show password"
                      className="w-5 h-5"
                    />
                  )}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="new-password"
                className="block mb-2 text-sm font-medium"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 border border-[var(--color-border)] rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  {showNewPassword ? (
                    <img
                      src="/icons/visibility.svg"
                      alt="Hide password"
                      className="w-5 h-5"
                    />
                  ) : (
                    <img
                      src="/icons/visibility_off.svg"
                      alt="Show password"
                      className="w-5 h-5"
                    />
                  )}
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Must be at least 8 characters long.
              </p>
            </div>

            <div className="mb-6">
              <label
                htmlFor="confirm-password"
                className="block mb-2 text-sm font-medium"
              >
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border border-[var(--color-border)] rounded-lg"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[var(--color-border)] rounded-lg"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[var(--color-blue)] text-white rounded-lg hover:bg-[var(--color-blue-shadow)]"
                disabled={isLoading}
              >
                {isLoading ? "Changing..." : "Change Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PasswordChangeModal;
