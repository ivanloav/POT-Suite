import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

export type SuiteSidebarItem = {
  id: string;
  label: string;
  path?: string;
  icon?: React.ReactNode;
  badge?: string;
  children?: SuiteSidebarItem[];
};

export type SuiteSidebarSection = {
  id: string;
  title?: string;
  items: SuiteSidebarItem[];
};

export type SuiteSidebarProps = {
  sections: SuiteSidebarSection[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  collapsed?: boolean;
  className?: string;
};

const hasActiveChild = (item: SuiteSidebarItem, path: string): boolean => {
  if (item.path && path.startsWith(item.path)) return true;
  if (!item.children) return false;
  return item.children.some((child) => hasActiveChild(child, path));
};

export function SuiteSidebar({
  sections,
  header,
  footer,
  collapsed = false,
  className = "",
}: SuiteSidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname || "/";
  const widthClass = collapsed ? "w-20" : "w-64";

  const depthPadding = ["pl-4", "pl-8", "pl-12", "pl-16", "pl-20"];

  const initialOpenState = useMemo(() => {
    const openState: Record<string, boolean> = {};

    const walk = (items: SuiteSidebarItem[]) => {
      items.forEach((item) => {
        if (item.children && item.children.length > 0) {
          openState[item.id] = hasActiveChild(item, currentPath);
          walk(item.children);
        }
      });
    };

    sections.forEach((section) => walk(section.items));
    return openState;
  }, [sections, currentPath]);

  const [openMap, setOpenMap] = useState<Record<string, boolean>>(initialOpenState);

  useEffect(() => {
    setOpenMap((prev) => ({ ...prev, ...initialOpenState }));
  }, [initialOpenState]);

  const toggleItem = (id: string) => {
    setOpenMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderItem = (item: SuiteSidebarItem, depth: number) => {
    const hasChildren = !!item.children?.length;
    const isActive = hasActiveChild(item, currentPath);
    const isOpen = openMap[item.id];
    const paddingClass = depthPadding[Math.min(depth, depthPadding.length - 1)];
    const iconSizeClass = depth === 0 ? "text-[20px]" : "text-[16px]";

    if (hasChildren) {
      return (
        <div key={item.id} className="pot-sidebar-group">
          <button
            type="button"
            className={`w-full flex items-center justify-between gap-3 ${paddingClass} py-3 rounded-lg transition-colors ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onClick={() => toggleItem(item.id)}
          >
            <span className="flex items-center gap-3">
              {item.icon ? (
                <span className={`inline-flex h-5 w-5 ${iconSizeClass}`}>
                  {item.icon}
                </span>
              ) : null}
              <span className="text-sm font-medium">{item.label}</span>
            </span>
            <span className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""} ${isActive ? "text-white" : "text-gray-500"}`}>
              <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
                <path d="M6 7.5L10 11.5L14 7.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </button>
          {isOpen && (
            <div className="mt-2 space-y-2">
              {item.children!.map((child) => renderItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.id}
        to={item.path || "#"}
        className={({ isActive: linkActive }) =>
          `flex items-center justify-between gap-3 ${paddingClass} py-3 rounded-lg transition-colors ${
            linkActive || isActive
              ? "bg-blue-600 text-white"
              : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`
        }
      >
        <span className="flex items-center gap-3">
          {item.icon ? (
            <span className={`inline-flex h-5 w-5 ${iconSizeClass}`}>
              {item.icon}
            </span>
          ) : null}
          <span className="text-sm font-medium">{item.label}</span>
        </span>
        {item.badge ? (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
            {item.badge}
          </span>
        ) : null}
      </NavLink>
    );
  };

  return (
    <aside
      className={`bg-white dark:bg-gray-800 shadow-md flex flex-col min-h-0 h-full shrink-0 ${widthClass} ${className}`.trim()}
    >
      {header ? (
        <div
          className="p-4 border-b border-gray-200 dark:border-gray-700"
        >
          {header}
        </div>
      ) : null}
      <nav
        className="p-4 space-y-4 flex-1 overflow-y-auto"
      >
        {sections.map((section) => (
          <div key={section.id} className="space-y-2">
            {section.title ? (
              <div
                className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                {section.title}
              </div>
            ) : null}
            <div className="space-y-2">{section.items.map((item) => renderItem(item, 0))}</div>
          </div>
        ))}
      </nav>
      {footer ? (
        <div
          className="p-4 border-t border-gray-200 dark:border-gray-700"
        >
          {footer}
        </div>
      ) : null}
    </aside>
  );
}
