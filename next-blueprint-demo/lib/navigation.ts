export type DashboardNavItem = {
  href: string;
  label: string;
};

export const dashboardNavItems: DashboardNavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/ordenes", label: "Órdenes" },
  { href: "/clientes", label: "Clientes" },
  { href: "/vehiculos", label: "Vehículos" },
  { href: "/reportes", label: "Reportes" },
];
