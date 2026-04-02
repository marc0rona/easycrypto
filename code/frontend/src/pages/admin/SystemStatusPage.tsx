import { AdminStatCard } from '../../components/admin/AdminStatCard';

const systemStatuses = [
  { label: 'API status', value: 'Online', meta: 'Requests are being processed normally' },
  { label: 'Extension sync', value: 'Working', meta: 'Browser sync is operating correctly' },
  { label: 'Database', value: 'Connected', meta: 'Primary datastore connection is healthy' },
] as const;

export function SystemStatusPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/70">
          Platform health
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          System Status
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-neutral-300 sm:text-base">
          Check the core platform services and confirm everything is operating as expected.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {systemStatuses.map((status) => (
          <AdminStatCard
            key={status.label}
            label={status.label}
            meta={status.meta}
            value={status.value}
          />
        ))}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-xl font-semibold text-white">Monitoring note</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-300">
          All values on this page are mock statuses for now, but the structure is ready to connect
          to real monitoring data later.
        </p>
      </section>
    </div>
  );
}
