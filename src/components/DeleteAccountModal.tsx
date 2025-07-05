import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../store/auth";
import { useNavigate } from "react-router-dom";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeleteAccountModal = ({ isOpen, onClose }: DeleteAccountModalProps) => {
  const { t } = useTranslation();
  const { deleteUser } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError(t("errors.passwordRequired"));
      return;
    }

    try {
      setIsDeleting(true);
      await deleteUser(password);
      // After successful deletion, redirect to home page
      navigate("/");
    } catch (err: any) {
      console.error("Error deleting account:", err);

      // Gérer les différents cas d'erreur
      if (err.message.includes("404") || err.message.includes("Not Found")) {
        setError(t("errors.apiEndpointNotFound"));
      } else if (
        err.message.includes("401") ||
        err.message.includes("Unauthorized")
      ) {
        setError(t("errors.wrongPassword"));
      } else if (
        err.message.includes("403") ||
        err.message.includes("Forbidden")
      ) {
        setError(t("errors.notAuthorized"));
      } else {
        setError(err.message || t("errors.genericError"));
      }

      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--color-background-main)] p-6 rounded-2xl border border-[var(--color-border)] w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-[var(--color-red)]">
          {t("profile.deleteAccountConfirmation")}
        </h2>

        <p className="mb-4">{t("profile.deleteAccountWarning")}</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">{t("auth.password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded border border-[var(--color-border)] bg-[var(--color-background-secondary)]"
              placeholder={t("auth.password")}
            />
          </div>

          {error && <div className="mb-4 text-[var(--color-red)]">{error}</div>}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-sm font-medium border border-[var(--color-border)] hover:bg-[var(--color-background-secondary)]"
              disabled={isDeleting}
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded text-sm font-medium text-white bg-[var(--color-red)] hover:bg-[var(--color-red-shadow)]"
              disabled={isDeleting}
            >
              {isDeleting ? t("common.loading") : t("profile.delete")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
