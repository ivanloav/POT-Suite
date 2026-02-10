import { jwtDecode, JwtPayload } from "jwt-decode";
import { SUITE_LOGIN_URL } from "../config";

export const checkTokenExpiration = (): void => {
  const tokenMatch = document.cookie.match(/(^| )accessToken=([^;]+)/);
  const token = tokenMatch ? decodeURIComponent(tokenMatch[2]) : null;

  if (token) {
    const decodedToken = jwtDecode<JwtPayload>(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp && decodedToken.exp < currentTime) {
      // Limpia cookies
      document.cookie = "accessToken=; Max-Age=0; path=/";
      document.cookie = "selectedSite=; Max-Age=0; path=/";
      window.location.href = SUITE_LOGIN_URL;
    }
  }
};
