import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <DashboardSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Panel de administración del taller
          </p>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
