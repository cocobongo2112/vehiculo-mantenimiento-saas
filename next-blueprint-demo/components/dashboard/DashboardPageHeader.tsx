type DashboardPageHeaderProps = {
  title: string;
  description: string;
};

export function DashboardPageHeader({
  title,
  description,
}: DashboardPageHeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
    </header>
  );
}
