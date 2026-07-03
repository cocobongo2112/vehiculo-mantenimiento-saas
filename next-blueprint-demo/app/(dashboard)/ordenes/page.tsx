import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";

export default function OrdenesPage() {
  return (
    <>
      <DashboardPageHeader
        title="Órdenes"
        description="Listado y seguimiento de órdenes de servicio del taller."
      />
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
        Contenido de órdenes — próxima migración desde Express/EJS.
      </div>
    </>
  );
}
