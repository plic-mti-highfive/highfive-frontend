import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { scrollScope } from "@shared/lib/scrollScope";

export function ScrollToTop() {
  const { pathname } = useLocation();
  const scope = scrollScope(pathname);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [scope]);

  return null;
}
