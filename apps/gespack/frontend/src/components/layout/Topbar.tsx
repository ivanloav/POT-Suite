import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { SuiteTopbar } from "@pot/ui-kit";
import { handleLogout } from "../../hooks/checkAuth";
import LanguageDropdown from "../navigation/LanguageDropdown";

export function Topbar({ className = "" }) {
  const navigate = useNavigate();
  const { t } = useTranslation("sidebar");
  const [userName, setUserName] = useState("Usuario");

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data?.name) {
          setUserName(data.data.name);
          localStorage.setItem("userId", data.data.userId);
          localStorage.setItem("userName", data.data.name);
        }
      })
      .catch(() => {});
  }, []);

  const menuItems = [
    {
      id: "account",
      label: t("topbar.myAccount"),
      icon: <FaUserCircle className="w-4 h-4" />,
      onClick: () => navigate("/account"),
    },
    {
      id: "logout",
      label: t("topbar.logout"),
      icon: <FaSignOutAlt className="w-4 h-4" />,
      onClick: () => handleLogout(),
    },
  ];

  return (
    <SuiteTopbar
      className={className}
      title="GesPack"
      logoSrc={`${import.meta.env.BASE_URL}images/GesPack-Icono.png`}
      logoAlt="GesPack"
      userLabel={userName}
      actions={<LanguageDropdown />}
      menuItems={menuItems}
    />
  );
}
