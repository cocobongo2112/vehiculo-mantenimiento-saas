import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";

export default function VehiculosPage() {
  return (
    <>
      <DashboardPageHeader
        title="Vehículos"
        description="Inventario de vehículos registrados por cliente y estado de mantenimiento."
      />
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
        Contenido de vehículos — próxima migración desde Express/EJS.
      </div>
    </>
  );
}
