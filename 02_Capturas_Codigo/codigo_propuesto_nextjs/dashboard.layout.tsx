export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="dashboard-layout">
      <aside>
        <h2>Smart Garage</h2>

        <nav>
          <a href="/dashboard">Dashboard</a>
          <a href="/ordenes">Órdenes</a>
          <a href="/clientes">Clientes</a>
          <a href="/reportes">Reportes</a>
        </nav>
      </aside>

      <section>{children}</section>
    </main>
  );
}