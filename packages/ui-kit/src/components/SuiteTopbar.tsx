import React, { useEffect, useRef, useState } from "react";

export type SuiteTopbarMenuItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
};

export type SuiteTopbarProps = {
  title: string;
  logoSrc?: string;
  logoAlt?: string;
  userLabel?: string;
  actions?: React.ReactNode;
  menuItems?: SuiteTopbarMenuItem[];
  className?: string;
};

export type SuiteTopbarActionButtonProps = {
  title?: string;
  onClick?: () => void;
  children: React.ReactNode;
};

export function SuiteTopbarActionButton({
  title,
  onClick,
  children,
}: SuiteTopbarActionButtonProps) {
  return (
    <button
      type="button"
      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      title={title}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function SuiteTopbar({
  title,
  logoSrc,
  logoAlt = "Logo",
  userLabel = "Usuario",
  actions,
  menuItems,
  className = "",
}: SuiteTopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleMenuItemClick = (item: SuiteTopbarMenuItem) => {
    item.onClick();
    setMenuOpen(false);
  };

  const hasMenu = (menuItems?.length ?? 0) > 0;

  return (
    <header
      className={`w-full bg-white dark:bg-gray-800 shadow-md ${className}`.trim()}
    >
      <div className="px-6 py-4 flex items-center justify-between min-h-[72px]">
        <div className="flex items-center gap-3 min-w-0">
          {logoSrc ? (
            <img
              className="h-10 w-10 object-contain shrink-0"
              src={logoSrc}
              alt={logoAlt}
            />
          ) : null}
          <span className="text-xl font-bold text-gray-900 dark:text-white truncate">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}

          {(userLabel || hasMenu) && (
            <div className="relative" ref={menuRef}>
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <span className="h-4 w-4 text-gray-600 dark:text-gray-200" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21c0-4-4-7-8-7s-8 3-8 7" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-white max-w-[160px] truncate">
                {userLabel}
              </span>
              <span className={`h-4 w-4 text-gray-500 transition-transform ${menuOpen ? "rotate-180" : ""}`}>
                <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </button>

            {hasMenu && menuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-1 z-50"
                role="menu"
              >
                {menuItems!.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleMenuItemClick(item)}
                    role="menuitem"
                  >
                    {item.icon ? <span className="inline-flex">{item.icon}</span> : null}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </header>
  );
}
