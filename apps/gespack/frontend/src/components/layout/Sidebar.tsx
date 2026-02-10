import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  RiDashboard2Line,
} from "react-icons/ri";
import {
  FaShoppingCart,
  FaFileAlt,
  FaRegMoneyBillAlt,
  FaUsers,
  FaListUl,
  FaClipboardList,
  FaUndo,
  FaCogs,
  FaFileImport,
  FaUserCircle,
  FaChartLine,
} from "react-icons/fa";
import { SuiteSidebar, SuiteSidebarSection, SuiteSidebarItem } from "@pot/ui-kit";
import SiteDropdown from "../navigation/SiteDropdown";
import { useSite } from "../../context/SiteContext";

export function CustomSidebar() {
  const { t } = useTranslation("sidebar");
  const { siteId, setSiteId } = useSite();

  const sections = useMemo<SuiteSidebarSection[]>(() => {
    const wipLabel = t("badges.wip");

    const generalItems: SuiteSidebarItem[] = [
      {
        id: "dashboard",
        label: t("menus.dashboard.label"),
        path: "/user/dashboard",
        icon: <RiDashboard2Line className="text-blue-600" />,
        badge: wipLabel,
      },
      {
        id: "orders",
        label: t("menus.orders.label"),
        path: "/user/orders",
        icon: <FaClipboardList className="text-green-600" />,
        badge: wipLabel,
      },
      {
        id: "billing",
        label: t("menus.billing.label"),
        path: "/user/billing",
        icon: <FaRegMoneyBillAlt className="text-green-500" />,
        badge: wipLabel,
      },
      {
        id: "customers",
        label: t("menus.customers.label"),
        path: "/user/customers",
        icon: <FaUsers className="text-sky-500" />,
        badge: wipLabel,
      },
      {
        id: "actions",
        label: t("menus.actions.label"),
        path: "/user/actions",
        icon: <FaListUl className="text-slate-400" />,
        badge: wipLabel,
      },
      {
        id: "products",
        label: t("menus.products.label"),
        path: "/user/products",
        icon: <FaShoppingCart className="text-orange-500" />,
        badge: wipLabel,
      },
      {
        id: "returns",
        label: t("menus.returns.label"),
        path: "/user/return-list",
        icon: <FaUndo className="text-yellow-500" />,
        badge: wipLabel,
      },
      {
        id: "imports",
        label: t("menus.import"),
        path: "/user/import-list",
        icon: <FaFileImport className="text-red-500" />,
        badge: wipLabel,
      },
    ];

    const adminItems: SuiteSidebarItem[] = [
      {
        id: "admin-users",
        label: t("menus.admin.users.label"),
        icon: <FaUserCircle className="text-purple-600" />,
        badge: wipLabel,
        children: [
          {
            id: "admin-users-stats",
            label: t("menus.admin.users.stats"),
            path: "/user/user-stats",
            icon: <FaChartLine />,
            badge: wipLabel,
          },
          {
            id: "admin-users-list",
            label: t("menus.admin.users.label"),
            path: "/user/user-list",
            icon: <FaUserCircle />,
            badge: wipLabel,
          },
        ],
      },
      {
        id: "documentation",
        label: t("menus.documentation"),
        path: "/user/documentation",
        icon: <FaFileAlt className="text-blue-500" />,
        badge: wipLabel,
      },
      {
        id: "settings",
        label: t("menus.admin.settings.label"),
        path: "/user/settings",
        icon: <FaCogs className="text-slate-500" />,
        badge: wipLabel,
      },
    ];

    return [
      {
        id: "general",
        title: t("sections.general"),
        items: generalItems,
      },
      {
        id: "admin",
        title: t("sections.admin"),
        items: adminItems,
      },
    ];
  }, [t]);

  return (
    <SuiteSidebar
      sections={sections}
      header={(
        <SiteDropdown
          selectedSite={siteId}
          onSiteChange={(id, name) => setSiteId(id, name)}
        />
      )}
    />
  );
}
