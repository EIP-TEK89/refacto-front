import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="app-footer">
      <p>{t("footer.copyright")}</p>
    </footer>
  );
};

export default Footer;
