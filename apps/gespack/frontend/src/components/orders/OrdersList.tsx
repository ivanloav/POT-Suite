import React, { useMemo } from "react";
import "./OrdersList.css";
import { useTranslation } from "react-i18next";
import { DataTable } from "../shared/DataTable";
import { FaUserPlus, FaCloudUploadAlt, FaDownload } from "react-icons/fa";
import { useSetBreadcrumbActions } from "../../hooks/useBreadcrumbActions";
import { useOrdersList } from "../../hooks/useOrdersList";
import { useSelectedSite } from "../../hooks/useSelectedSite";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "../../hooks/useMediaQuery";

export const OrdersList: React.FC = () => {
  const { t } = useTranslation("order");
  const { columns, fetchPage } = useOrdersList();
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
      <DataTable
        title={t("title")}
        columns={columns}
        fetchPage={fetchPage}
        initialLimit={10}
        initialFilters={{}}
        initialSortBy="orderId"
        initialSortDir="DESC"
      />
    </>
  );
};
