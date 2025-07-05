import { useState } from "react";
import { useAuth } from "../store/auth";
import { useTranslation } from "react-i18next";

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PasswordChangeModal = ({ isOpen, onClose }: PasswordChangeModalProps) => {
  const { t } = useTranslation();
  const { changePassword, error } = useAuth();
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
      setLocalError(
        !currentPassword
          ? t("errors.currentPasswordRequired")
          : !newPassword
          ? t("errors.newPasswordRequired")
          : t("errors.passwordRequired")
      );
      return;
    }

    // Password confirmation check
    if (newPassword !== confirmPassword) {
      setLocalError(t("errors.passwordsDoNotMatch"));
      return;
    }

    // Password strength validation
    if (newPassword.length < 8) {
      setLocalError(t("errors.passwordTooShort"));
      return;
    }

    // Prevent setting the same password
    if (currentPassword === newPassword) {
      setLocalError(t("errors.samePassword"));
      return;
    }

    setIsLoading(true);

    try {
      await changePassword(currentPassword, newPassword);

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
    } catch (err: any) {
      // Gérer les erreurs localement
      console.error("Failed to change password:", err);

      // Définir un message d'erreur approprié basé sur l'erreur
      if (
        err.message.includes("Current password is incorrect") ||
        err.message.includes("401") ||
        err.message.includes("Unauthorized")
      ) {
        setLocalError(t("errors.currentPasswordIncorrect"));
      } else if (
        err.message.includes("403") ||
        err.message.includes("not authorized")
      ) {
        setLocalError(t("errors.notAuthorized"));
      } else if (
        err.message.includes("404") ||
        err.message.includes("not found")
      ) {
        setLocalError(t("errors.userNotFound"));
      } else {
        setLocalError(err.message || t("errors.genericError"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[var(--color-background-main)] rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{t("profile.changePassword")}</h2>
          <button onClick={onClose} className="text-xl" aria-label="Close">
            &times;
          </button>
        </div>

        {success ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {t("profile.passwordChangedSuccess")}
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
                {t("profile.oldPassword")}
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
                {t("profile.newPassword")}
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
                {t("errors.passwordTooShort")}
              </p>
            </div>

            <div className="mb-6">
              <label
                htmlFor="confirm-password"
                className="block mb-2 text-sm font-medium"
              >
                {t("profile.confirmNewPassword")}
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
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[var(--color-blue)] text-white rounded-lg hover:bg-[var(--color-blue-shadow)]"
                disabled={isLoading}
              >
                {isLoading ? t("common.loading") : t("profile.changePassword")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PasswordChangeModal;
