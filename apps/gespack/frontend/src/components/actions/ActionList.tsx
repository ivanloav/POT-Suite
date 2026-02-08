import React, { useMemo } from "react";
import "./ActionList.css";
import { useTranslation } from "react-i18next";
import { FaUserPlus, FaCloudUploadAlt, FaDownload } from "react-icons/fa";
import { useSetBreadcrumbActions } from "../../hooks/useBreadcrumbActions";
import { useSelectedSite } from "../../hooks/useSelectedSite";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { WIP } from "../layout/WIP";

export const ActionList: React.FC = () => {
  const { t } = useTranslation("billing");
  const currentSiteId = useSelectedSite();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 1400px) and (pointer: coarse)");

  const breadcrumbActions = useMemo(() => {
    if (!currentSiteId.siteId || currentSiteId.siteId === 0) return null;
    return (
      <>
        {!isMobile && (
          <button className="btn btn-primary" onClick={() => navigate("/user/create-order")}> 
            <FaUserPlus /> <span>{t("actions.addOrder")}</span>
          </button>
        )}
        <button className="btn btn-secondary">
          <FaDownload /> {t("actions.exportStats")}
        </button>
        <button className="btn btn-tertiary">
          <FaCloudUploadAlt /> {t("actions.import")}
        </button>
      </>
    );
  }, [currentSiteId, isMobile, navigate, t]);

  useSetBreadcrumbActions(breadcrumbActions);

  return (
    <>
      <div>
        <WIP />
      </div>
    </>
  );
};
