import Link from "next/link";

import { DashboardNav } from "@/components/dashboard/DashboardNav";

export function DashboardSidebar() {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900 text-zinc-100">
      <div className="border-b border-zinc-800 px-5 py-6">
        <Link href="/dashboard" className="group block">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
            SaaS Taller
          </span>
          <span className="mt-1 block text-xl font-bold tracking-tight text-white group-hover:text-amber-300">
            Smart Garage
          </span>
        </Link>
        <p className="mt-2 text-xs text-zinc-500">
          Gestión de órdenes, clientes y vehículos
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <DashboardNav />
      </div>

      <div className="border-t border-zinc-800 px-5 py-4">
        <p className="text-xs text-zinc-500">Blueprint Next.js</p>
        <p className="text-sm font-medium text-zinc-300">Demo académica</p>
      </div>
    </aside>
  );
}
