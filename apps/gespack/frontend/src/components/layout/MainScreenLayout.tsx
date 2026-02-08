import { useState } from "react";
import { Outlet, useMatches } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CustomSidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { UserProvider } from "../../context/UserContext";
import Breadcrumbs from "../navigation/Breadcrumbs";
import "./MainScreenLayout.css";
import { useSite } from "../../context/SiteContext";
import { useBreadcrumbActions } from "../../context/BreadcrumbActionsContext";
import { useFooter } from "../../context/FooterContext";

export function ScreenLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { t } = useTranslation(["titles", "translation", "sidebar", "breadcrumb"]);
  const matches = useMatches();
  const { siteId } = useSite();
  const { isVisible, content } = useFooter();
  const last = matches[matches.length - 1];
  const title =
    (last?.handle as any)?.titleKey
      ? t((last?.handle as any).titleKey)
      : (last?.handle as any)?.title || "";
  const {actions: breadcrumbActions } = useBreadcrumbActions();

  // Obtener el userName desde localStorage, cookie, o un estado global
  // Aquí lo tomamos de localStorage como ejemplo
  const userName = localStorage.getItem("userName") || "Usuario";
  const userIdRaw = localStorage.getItem("userId");
  const userId = userIdRaw ? Number(userIdRaw) : undefined;

  return (
    <UserProvider user={{ userName, userId }}>
      <div className={`backgroundUser ${isSidebarCollapsed ? "collapsed" : ""}`}>
        <Topbar className="topbar" />
        <div className="layout-flex">
          <CustomSidebar onToggleCollapse={(v) => setIsSidebarCollapsed(v)} />
          <main className={`main-content${isVisible ? " has-footer" : ""}`}>
            <section id="main-scroll" className="page-body" key={siteId}>
              <header className="page-header">
                {title && <h1 className="page-title">{title}</h1>}
                <Breadcrumbs actions={breadcrumbActions} />
              </header>
              <Outlet context={{ selectedSite: siteId }} />
            </section>
            {isVisible && (
              <div className="footer">
                {content}
              </div>
            )}
          </main>
        </div>
      </div>
    </UserProvider>
  );
}