import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";

export default function ClientesPage() {
  return (
    <>
      <DashboardPageHeader
        title="Clientes"
        description="Directorio de clientes y historial de servicios asociados."
      />
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
        Contenido de clientes — próxima migración desde Express/EJS.
      </div>
    </>
  );
}
