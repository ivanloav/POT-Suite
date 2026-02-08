import { useTranslation } from "react-i18next";
import "./LanguageDropdown.css";
import { FaAngleDown } from "react-icons/fa";
import { useState } from "react";

type Lang = { code: string; flag: string };
const LANGS: Lang[] = [
  { code: "es", flag: "/flags/es.svg" },
  { code: "fr", flag: "/flags/fr.svg" },
  { code: "en", flag: "/flags/en.svg" },
];

export default function LanguageDropdown() {
  const { i18n, t } = useTranslation("lang");
  const [open, setOpen] = useState(false);
  const current = (i18n.resolvedLanguage || i18n.language || "es").slice(0, 2);
  const currentLang = LANGS.find((l) => current.startsWith(l.code)) || LANGS[0];

  const change = async (code: string) => {
    await i18n.changeLanguage(code);
    setOpen(false); // ⬅️ cerrar al elegir idioma
  };

  return (
    <div
      className={`user-dropdown ${open ? "is-open" : ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="user-trigger"
        type="button"
        onClick={() => setOpen(!open)}
      >
        <img src={currentLang.flag} alt="" className="lang-dd__flag" />
        <span className="user-name">{t(currentLang.code)}</span>
        <FaAngleDown className="user-caret" />
      </button>

      {open && (
        <div className="user-menu" role="menu">
          {LANGS.map((l) => (
            <button
              key={l.code}
              className={`user-menu-item ${currentLang.code === l.code ? "is-active" : ""}`}
              role="menuitem"
              onClick={() => change(l.code)}
            >
              <img src={l.flag} alt="" className="lang-dd__flag" />
              <span>{t(l.code)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}