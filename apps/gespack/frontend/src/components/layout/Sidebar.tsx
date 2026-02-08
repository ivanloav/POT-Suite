import React, { useEffect, useState } from "react";
import {
  Sidebar as PSidebar,
  Menu,
  MenuItem,
  SubMenu,
  sidebarClasses,
} from "react-pro-sidebar";
import { useTranslation } from "react-i18next";
import { RiDashboard2Line } from "react-icons/ri";
import {
  FaShoppingCart, FaFileAlt, FaChevronLeft, FaChevronRight, FaBars,
  FaRegMoneyBillAlt, FaUsers, FaListUl, FaClipboardList, FaUndo, FaCogs,
  FaFileImport, FaUserCircle, FaChartLine
} from "react-icons/fa";
import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";
import SiteDropdown from "../navigation/SiteDropdown";
import { useSite } from "../../context/SiteContext";
import { useSidebarContext } from "../../context/SidebarContext";

interface CustomSidebarProps {
  onToggleCollapse: (isCollapsed: boolean) => void;
}

const getInitialState = () => {
  const width = window.innerWidth;
  
  if (width <= 768) { // 👈 CAMBIAR: <= 767 en lugar de < 768
    // Mobile: sidebar oculta, no colapsada, es móvil
    return {
      isCollapsed: false,
      isMobile: true,
      isSidebarVisible: false
    };
  } else if (width >= 768 && width <= 1200) {
    // Tablet: sidebar visible y colapsada, no es móvil
    return {
      isCollapsed: true,
      isMobile: false,
      isSidebarVisible: true
    };
  } else {
    // Desktop: sidebar visible y expandida, no es móvil
    return {
      isCollapsed: false,
      isMobile: false,
      isSidebarVisible: true
    };
  }
};

export const CustomSidebar: React.FC<CustomSidebarProps> = ({ onToggleCollapse }) => {
  const initialState = getInitialState();
  
  const [isCollapsed, setIsCollapsed] = useState(initialState.isCollapsed);
  const [isMobile, setIsMobile] = useState(initialState.isMobile);
  const [isSidebarVisible, setIsSidebarVisible] = useState(initialState.isSidebarVisible);

  const { t } = useTranslation("sidebar");
  const [expandedSubMenu, setExpandedSubMenu] = useState<string | null>(null);
  const navigate = useNavigate();

  const { siteId, setSiteId } = useSite(); // ⬅️ contexto
  const { forceSidebarCollapse } = useSidebarContext(); // ⬅️ contexto modal

  const applySidebarWidthVar = (collapsed: boolean, mobile: boolean) => {
  const rootStyles = getComputedStyle(document.documentElement);
  const collapsedW = rootStyles.getPropertyValue('--sidebar-width-md').trim();
  const expandedW = rootStyles.getPropertyValue('--sidebar-width-lg').trim();
  const w = mobile ? "0px" : (collapsed ? collapsedW : expandedW);
  document.documentElement.style.setProperty("--sidebar-w", w);
  };

  useEffect(() => {
  const handleResize = () => {
    const width = window.innerWidth;
    
    if (width <= 768) { // 👈 CAMBIAR: <= 767
      // Mobile
      setIsMobile(true);
      setIsCollapsed(false);
      setIsSidebarVisible(false);
      applySidebarWidthVar(false, true);
    } else if (width >= 769 && width <= 1200) {
      // Tablet
      setIsMobile(false);
      setIsCollapsed(true);
      setIsSidebarVisible(true);
      applySidebarWidthVar(true, false);
    } else {
      // Desktop
      setIsMobile(false);
      setIsCollapsed(false);
      setIsSidebarVisible(true);
      applySidebarWidthVar(false, false);
    }
  };

  window.addEventListener("resize", handleResize);
  handleResize();
  return () => window.removeEventListener("resize", handleResize);
}, []);

  // Efecto para forzar colapso cuando se abre un modal
  useEffect(() => {
    if (forceSidebarCollapse && !isMobile) {
      setIsCollapsed(true);
      applySidebarWidthVar(true, false);
    } else if (!forceSidebarCollapse && !isMobile) {
      // Volver al estado basado en el tamaño de pantalla
      const width = window.innerWidth;
      const shouldBeCollapsed = width >= 769 && width <= 1200;
      setIsCollapsed(shouldBeCollapsed);
      applySidebarWidthVar(shouldBeCollapsed, false);
    }
  }, [forceSidebarCollapse, isMobile]);

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onToggleCollapse(newCollapsedState);
    applySidebarWidthVar(newCollapsedState, isMobile);
  };

  const toggleMobileSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  const handleSubMenuClick = (menuId: string) => {
    setExpandedSubMenu(prev => (prev === menuId ? null : menuId));
    if (expandedSubMenu !== menuId) setIsSidebarVisible(true);
  };

  const handleItemClick = (path: string) => {
    setExpandedSubMenu(null);
    navigate(path);
    // Auto-colapsar en móvil tras navegar
    if (isMobile) {
      setIsSidebarVisible(false);
    }
  };

  return (
    <div className="dashboard-container">
      {isMobile && isSidebarVisible && (
        <div className="sidebar-backdrop" onClick={() => setIsSidebarVisible(false)} />
      )}
      {isMobile && (
        <button className="hamburger-button" onClick={toggleMobileSidebar} aria-label="Toggle sidebar">
          <FaBars />
        </button>
      )}

      <PSidebar
        className={`sidebar-container${isCollapsed ? " collapsed" : ""}${isMobile && isSidebarVisible ? " expanded" : ""}`}
        collapsed={isCollapsed && !isMobile}
        width={isMobile ? "100vw" : getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width-lg').trim() || '300px'}
        collapsedWidth={getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width-md').trim() || '80px'}
        backgroundColor="#0c1b33"
        rootStyles={{
          [`.${sidebarClasses.root}`]: {
            transition: "width 0.3s ease-in-out",
            willChange: "width"
          },
          [`.${sidebarClasses.container}`]: {
            overflow: "visible"
          },
          ".ps-submenu-content": { backgroundColor: "#112546" }
        }}
      >
        <div className="sidebar-logo">
          <img
            src={`${import.meta.env.BASE_URL}${isCollapsed ? "images/GesPack-Icono.png" : "images/GesPack-Sidebar.png"}`}
            alt="Logo"
            style={{ width: isCollapsed ? "40px" : "120px" }}
            onClick={(e) => { e.preventDefault(); handleItemClick("/user/dashboard"); }}
          />
        </div>

        <Menu
          menuItemStyles={{
            button: ({ level, active }) => ({
              color: "#b6c1cd",
              fontSize: level === 0 ? "var(--text-sidebar-lg)" : "var(--text-sidebar-md)",
              backgroundColor: active ? "#1a273a" : "transparent",
              "&:hover": { backgroundColor: "#1a273a" },
              paddingLeft: level === 1 ? "30px" : "20px"
            }),
          }}
        >
          {/* ⬇️ SiteDropdown dentro de un MenuItem (sin importar MenuItem en SiteDropdown) */}
          {!isCollapsed && (
            <MenuItem>
              <SiteDropdown
                selectedSite={siteId}
                onSiteChange={(id, name) => {
                  setSiteId(id, name);
                  // Si estamos en móvil, ocultar la sidebar tras cambiar de site
                  if (isMobile) {
                    setIsSidebarVisible(false);
                  }
                }}
              />
            </MenuItem>
          )}

          {!isCollapsed && <h4 className="sidebar-section-title">{t("sections.general")}</h4>}

          <MenuItem
            icon={<RiDashboard2Line color="#fffb00ff" size={getComputedStyle(document.documentElement).getPropertyValue('--sidebar-icon-size').trim() || 24} />}
            suffix={!isCollapsed && <Label color="#ffa200ff">🚧 {t("badges.wip")}</Label>}
            onClick={(e) => { e.stopPropagation(); handleItemClick("/user/dashboard"); }}
          >
            {t("menus.dashboard.label")}
          </MenuItem>

          <MenuItem
            icon={<FaClipboardList color="#ffffffff" size={getComputedStyle(document.documentElement).getPropertyValue('--sidebar-icon-size').trim() || 24} />}
            suffix={!isCollapsed && <Label color="#ffa200ff">🚧 {t("badges.wip")}</Label>}
            onClick={(e) => { e.stopPropagation(); handleItemClick("/user/orders"); }}
          >
            {t("menus.orders.label")}
          </MenuItem>

          <MenuItem
            icon={<FaRegMoneyBillAlt color="#19b102ff" size={getComputedStyle(document.documentElement).getPropertyValue('--sidebar-icon-size').trim() || 24} />}
            suffix={!isCollapsed && <Label color="#ffa200ff">🚧 {t("badges.wip")}</Label>}
            onClick={(e) => { e.stopPropagation(); handleItemClick("/user/billing"); }}
          >
            {t("menus.billing.label")}
          </MenuItem>

          <MenuItem
            icon={<FaUsers color="#00fff7ff" size={getComputedStyle(document.documentElement).getPropertyValue('--sidebar-icon-size').trim() || 24} />}
            suffix={!isCollapsed && <Label color="#ffa200ff">🚧 {t("badges.wip")}</Label>}
            onClick={(e) => { e.stopPropagation(); handleItemClick("/user/customers"); }}
          >
            {t("menus.customers.label")}
          </MenuItem>

          <MenuItem
            icon={<FaListUl color="#857d7d7d" size={getComputedStyle(document.documentElement).getPropertyValue('--sidebar-icon-size').trim() || 24} />}
            suffix={!isCollapsed && <Label color="#ffa200ff">🚧 {t("badges.wip")}</Label>}
            onClick={(e) => { e.stopPropagation(); handleItemClick("/user/actions"); }}
          >
            {t("menus.actions.label")}
          </MenuItem>

          <MenuItem
            icon={<FaShoppingCart color="#b94c03d7" size={getComputedStyle(document.documentElement).getPropertyValue('--sidebar-icon-size').trim() || 24} />}
            suffix={!isCollapsed && <Label color="#ffa200ff">🚧 {t("badges.wip")}</Label>}
            onClick={(e) => { e.stopPropagation(); handleItemClick("/user/products"); }}
          >
            {t("menus.products.label")}
          </MenuItem>

          <MenuItem
            icon={<FaUndo color="#aeb102ff" size={getComputedStyle(document.documentElement).getPropertyValue('--sidebar-icon-size').trim() || 24} />}
            suffix={!isCollapsed && <Label color="#ffa200ff">🚧 {t("badges.wip")}</Label>}
            onClick={(e) => { e.stopPropagation(); handleItemClick("/user/return-list"); }}
          >
            {t("menus.returns.label")}
          </MenuItem>

          <MenuItem 
            icon={<FaFileImport color="#e34f4fff" size={getComputedStyle(document.documentElement).getPropertyValue('--sidebar-icon-size').trim() || 24} />}
            suffix={!isCollapsed && <Label color="#ffa200ff">🚧 {t("badges.wip")}</Label>}
            onClick={(e) => { e.stopPropagation(); handleItemClick("/user/import-list"); }}
          >
            {t("menus.import")}
          </MenuItem>

          {!isCollapsed && <h4 className="sidebar-section-title">{t("sections.admin")}</h4>}

          <SubMenu
            icon={<FaUserCircle color="#8c00ffff" size={getComputedStyle(document.documentElement).getPropertyValue('--sidebar-icon-size').trim() || 24} />}
            label={t("menus.admin.users.label")}
            open={expandedSubMenu === "users"}
            suffix={!isCollapsed && <Label color="#ffa200ff">🚧 {t("badges.wip")}</Label>}
            onClick={() => handleSubMenuClick("users")}
          >
            <MenuItem icon={<FaChartLine size={getComputedStyle(document.documentElement).getPropertyValue('--sidebar-icon-size').trim() || 24} />}
              suffix={!isCollapsed && <Label color="#ffa200ff">🚧 {t("badges.wip")}</Label>}
              onClick={(e) => { e.stopPropagation(); handleItemClick("/user/user-stats"); }}
            >
              {t("menus.admin.users.stats")}
            </MenuItem>
            <MenuItem icon={<FaUserCircle size={getComputedStyle(document.documentElement).getPropertyValue('--sidebar-icon-size').trim() || 24} />}
              suffix={!isCollapsed && <Label color="#ffa200ff">🚧 {t("badges.wip")}</Label>}
              onClick={(e) => { e.stopPropagation(); handleItemClick("/user/user-list"); }}
            >
              {t("menus.admin.users.label")}
            </MenuItem>
          </SubMenu>

          <MenuItem icon={<FaFileAlt color="#557ed7ff" size={getComputedStyle(document.documentElement).getPropertyValue('--sidebar-icon-size').trim() || 24} />} 
            suffix={!isCollapsed && <Label color="#ffa200ff">🚧 {t("badges.wip")}</Label>}
            onClick={(e) => { e.stopPropagation(); handleItemClick("/user/documentation"); }}
          >
            {t("menus.documentation")}
          </MenuItem>

          <MenuItem icon={<FaCogs color="#4f544fff" size={getComputedStyle(document.documentElement).getPropertyValue('--sidebar-icon-size').trim() || 24} />}
            suffix={!isCollapsed && <Label color="#ffa200ff">🚧 {t("badges.wip")}</Label>}
            onClick={(e) => { e.stopPropagation(); handleItemClick("/user/settings"); }}
          >
            {t("menus.admin.settings.label")}
          </MenuItem>
        </Menu>

        {!isMobile && (
          <button className="collapse-button" onClick={toggleSidebar} aria-label="Collapse sidebar">
            {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        )}
      </PSidebar>
    </div>
  );
};

const Label = styled.span<{ color: string }>`
  background-color: ${(props) => props.color};
  color: #fff;
  padding: 2px 4px;
  border-radius: 5px;
  font-size: var(--sidebar-label-font-size);
  font-weight: bold;
`;