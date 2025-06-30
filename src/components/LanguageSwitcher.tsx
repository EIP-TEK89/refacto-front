import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher">
      <button
        onClick={() => changeLanguage("en")}
        className={i18n.language === "en" ? "active" : ""}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage("fr")}
        className={i18n.language === "fr" ? "active" : ""}
        aria-label="Switch to French"
      >
        FR
      </button>
    </div>
  );
};

export default LanguageSwitcher;
