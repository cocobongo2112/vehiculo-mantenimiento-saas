import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";

export default function DashboardPage() {
  return (
    <>
      <DashboardPageHeader
        title="Dashboard"
        description="Resumen operativo del taller: órdenes activas, ingresos y alertas del día."
      />
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["Órdenes activas", "Clientes", "Vehículos en taller"].map((card) => (
          <article
            key={card}
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {card}
            </h2>
            <p className="mt-3 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              —
            </p>
          </article>
        ))}
      </section>
    </>
  );
}
