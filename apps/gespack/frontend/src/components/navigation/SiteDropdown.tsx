import React from "react";
import { FaTimes } from "react-icons/fa";
import "./SiteDropdown.css";
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
    <div className={`site-dropdown-container ${className ?? ""}`}>
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
        className="site-dropdown"
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

      {/* Muestra la X solo si hay un site específico (>0). Si es 0 (todos), no hace falta */}
  {value !== "0" && (
        <button
          className="clear-site-button"
          onClick={(e) => {
            e.stopPropagation();
            onSiteChange("0", "Todos los sites"); // ← limpiar = poner a 0
            window.dispatchEvent(new Event('siteChanged'));
          }}
          title={t("sitedropdown.button")}
        >
          <FaTimes className="clear-site-icon" />
        </button>
      )}
    </div>
  );
};

export default SiteDropdown;