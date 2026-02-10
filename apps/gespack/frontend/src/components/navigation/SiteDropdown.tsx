import React from "react";
import { FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useMySites } from "../../hooks/useMySites";

interface SiteDropdownProps {
  selectedSite: string; // ahora string
  onSiteChange: (siteId: string, siteName?: string) => void;
  className?: string;
}

const SiteDropdown: React.FC<SiteDropdownProps> = ({ selectedSite, onSiteChange, className }) => {
  const [t] = useTranslation("sidebar");
  const { data: sites, loading } = useMySites();

  // Valor controlado: 0 = Todos los sites
  const value = selectedSite ?? "0";

  return (
    <div className={`relative ${className ?? ""}`}>
      <select
        value={value}
        disabled={loading}
        onChange={(e) => {
          const v = e.target.value;
          let siteName = "";
          if (v === "0") {
            siteName = "Todos los sites";
          } else if (sites) {
            const found = sites.find(site => String(site.siteId) === String(v));
            siteName = found ? found.siteName : "Sin nombre";
          }
          onSiteChange(v, siteName);
          window.dispatchEvent(new Event('siteChanged'));
        }}
        className="w-full px-3 py-2 pr-10 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg appearance-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {/* Opción 0: TODOS */}
        <option value={0}>
          {loading ? t("sitedropdown.charge") : t("sitedropdown.placeholder")}
        </option>

        {sites?.map((site) => (
          <option key={site.siteId} value={site.siteId}>
            {site.siteName} {site.siteId}
          </option>
        ))}
      </select>

      {/* Ícono de dropdown */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Muestra la X solo si hay un site específico (>0). Si es 0 (todos), no hace falta */}
      {value !== "0" && (
        <button
          className="absolute right-8 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onSiteChange("0", "Todos los sites"); // ← limpiar = poner a 0
            window.dispatchEvent(new Event('siteChanged'));
          }}
          title={t("sitedropdown.button")}
        >
          <FaTimes className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default SiteDropdown;