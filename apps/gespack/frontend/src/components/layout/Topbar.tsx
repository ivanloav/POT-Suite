import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { handleLogout } from "../../hooks/checkAuth";
import { FaSignOutAlt, FaUserCircle, FaAngleDown, FaUserCog } from "react-icons/fa";
import LanguageDropdown from "../navigation/LanguageDropdown";
import { useTranslation } from "react-i18next";
import "./Topbar.css";

export function Topbar({ className = "" }) {
  const navigate = useNavigate();
  const { t } = useTranslation("sidebar");
  const [userName, setUserName] = useState("Usuario");
  const [open, setOpen] = useState(false);

  const logout = () => {
    handleLogout(navigate);
    setOpen(false); // ⬅️ cerrar al hacer logout
  };

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

  return (
    <div className={`head flex ${className}`}>
      <div className="configButtons">
        <div className="language-dropdown">
          <LanguageDropdown />
        </div>

        <div
          className={`user-dropdown ${open ? "is-open" : ""}`}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <button
            className="user-trigger"
            type="button"
            onClick={() => setOpen(!open)}
          >
            <FaUserCog className="user-avatar" />
            <span className="user-name">{userName}</span>
            <FaAngleDown className="user-caret" />
          </button>

          {open && (
            <div className="user-menu" role="menu">
              <button
                className="user-menu-item"
                onClick={() => {
                  navigate("/account");
                  setOpen(false); // ⬅️ cerrar al entrar en account
                }}
                role="menuitem"
              >
                <FaUserCircle style={{ marginRight: 8 }} /> {t("topbar.myAccount")}
              </button>
              <button className="user-menu-item" onClick={logout} role="menuitem">
                <FaSignOutAlt style={{ marginRight: 8 }} /> {t("topbar.logout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}