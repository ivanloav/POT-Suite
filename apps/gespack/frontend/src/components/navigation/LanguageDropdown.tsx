import { useTranslation } from "react-i18next";
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
    setOpen(false);
  };

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="inline-flex items-center gap-2 px-3 py-2 bg-transparent hover:bg-white/10 text-white rounded-lg transition-colors"
        type="button"
        onClick={() => setOpen(!open)}
      >
        <img src={currentLang.flag} alt="" className="w-5 h-5 rounded" />
        <span className="font-medium text-sm">{t(currentLang.code)}</span>
        <FaAngleDown className="w-3 h-3" />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 min-w-[200px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50" role="menu">
          {LANGS.map((l) => (
            <button
              key={l.code}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
                currentLang.code === l.code
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              role="menuitem"
              onClick={() => change(l.code)}
            >
              <img src={l.flag} alt="" className="w-5 h-5 rounded" />
              <span>{t(l.code)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}