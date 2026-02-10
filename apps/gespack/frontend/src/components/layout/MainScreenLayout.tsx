import { Outlet, useMatches } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CustomSidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { UserProvider } from "../../context/UserContext";
import Breadcrumbs from "../navigation/Breadcrumbs";
import { useSite } from "../../context/SiteContext";
import { useBreadcrumbActions } from "../../context/BreadcrumbActionsContext";
import { useFooter } from "../../context/FooterContext";

export function ScreenLayout() {
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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
        <Topbar />
        <div className="flex flex-1 overflow-hidden">
          <CustomSidebar />
          <main className={`flex-1 flex flex-col overflow-hidden ${isVisible ? "pb-16" : ""}`}>
            <section id="main-scroll" className="flex-1 overflow-y-auto p-6" key={siteId}>
              <header className="mb-6">
                {title && <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>}
                <Breadcrumbs actions={breadcrumbActions} />
              </header>
              <Outlet context={{ selectedSite: siteId }} />
            </section>
            {isVisible && (
              <div className="fixed bottom-0 right-0 left-64 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-10">
                {content}
              </div>
            )}
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
