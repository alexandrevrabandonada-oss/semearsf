import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { trackNavigation } from "../lib/observability";

export function RouteObservability() {
  const location = useLocation();

  useEffect(() => {
    trackNavigation(location.pathname);
  }, [location.pathname]);

  return null;
}
