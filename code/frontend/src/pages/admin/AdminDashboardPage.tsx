import { AdminStatCard } from '../../components/admin/AdminStatCard';

const adminStats = [
  { label: 'Total users', value: '1,284', meta: 'All registered accounts' },
  { label: 'Active users', value: '1,173', meta: 'Currently enabled accounts' },
  { label: 'Disabled users', value: '111', meta: 'Accounts restricted by admins' },
] as const;

export function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/70">
          System overview
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Admin Dashboard
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-neutral-300 sm:text-base">
          Monitor platform health, review account activity, and manage the EZ-CRYPT0 system from
          one place.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {adminStats.map((stat) => (
          <AdminStatCard key={stat.label} label={stat.label} meta={stat.meta} value={stat.value} />
        ))}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-xl font-semibold text-white">Admin summary</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-300">
          User activity is stable, core services are operating normally, and no major platform
          issues are currently flagged in this mock environment.
        </p>
      </section>
    </div>
  );
}
