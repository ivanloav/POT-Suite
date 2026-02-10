import { useEffect } from "react";
import { SUITE_LOGIN_URL } from "../../config";

export function SuiteRedirect() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.assign(SUITE_LOGIN_URL);
    }
  }, []);

  return null;
}
