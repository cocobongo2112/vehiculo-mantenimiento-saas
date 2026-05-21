"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { dashboardNavItems } from "@/lib/navigation";

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación principal" className="flex flex-col gap-1">
      {dashboardNavItems.map((item) => {
        const active = isNavItemActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-amber-500/15 text-amber-300"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
