const VERTICAL_DASHBOARD_ROUTES = {
  delivery: "/delivery/dashboard",
};

const DEFAULT_DASHBOARD_ROUTE = "/dashboard";

export const ALL_VERTICAL_DASHBOARD_ROUTES = Object.values(VERTICAL_DASHBOARD_ROUTES);

export function resolveDashboardRoute(vertical) {
  if (!vertical) return DEFAULT_DASHBOARD_ROUTE;
  const key = String(vertical).toLowerCase().trim();
  return VERTICAL_DASHBOARD_ROUTES[key] || DEFAULT_DASHBOARD_ROUTE;
}
