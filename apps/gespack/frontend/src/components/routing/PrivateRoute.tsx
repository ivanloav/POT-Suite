import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { SUITE_LOGIN_URL } from "../../config";

export const PrivateRoute = () => {
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        await axios.get("/auth/me", { withCredentials: true }); // ← usa /api/ si lo tienes en proxy
        setIsAuthed(true);
      } catch {
        setIsAuthed(false);
      }
    };
    checkSession();
  }, []);

  if (isAuthed === null) {
    return (
      <div className="loadingOverlay">
        <div className="spinner">Cargando...</div>
      </div>
    );
  }

  if (!isAuthed) {
    if (typeof window !== "undefined") {
      window.location.href = SUITE_LOGIN_URL;
    }
    return null;
  }

  return <Outlet />;
};
