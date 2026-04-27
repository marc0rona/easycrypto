import { useCallback, useEffect, useState } from 'react';

import { AdminStatCard } from '../../components/admin/AdminStatCard';
import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/ErrorState';
import { Loader } from '../../components/ui/Loader';

const defaultSystemStatuses = [
  { label: 'API status', value: 'Online', meta: 'Requests are being processed normally' },
  { label: 'Extension sync', value: 'Working', meta: 'Browser sync is operating correctly' },
  { label: 'Database', value: 'Connected', meta: 'Primary datastore connection is healthy' },
] as const;

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong while loading system status.';
}

export function SystemStatusPage() {
  const [systemStatuses, setSystemStatuses] = useState<(typeof defaultSystemStatuses)[number][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadSystemStatuses = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await Promise.resolve(defaultSystemStatuses);
      setSystemStatuses([...result]);
    } catch (error) {
      console.error('Failed to load system statuses.', error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSystemStatuses();
  }, [loadSystemStatuses]);

  return (
    <div className="layout-stack-xl">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300/70">
          Platform health
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          System Status
        </h1>
        <p className="max-w-2xl text-base leading-8 text-neutral-400">
          Check the core platform services and confirm everything is operating as expected.
        </p>
      </header>

      {isLoading ? (
        <Card className="p-0" tone="muted">
          <Loader message="Loading system status..." />
        </Card>
      ) : null}

      {!isLoading && errorMessage ? (
        <ErrorState
          message={errorMessage}
          onRetry={() => {
            void loadSystemStatuses();
          }}
        />
      ) : null}

      {!isLoading && !errorMessage ? (
        <>
          <section className="layout-grid-12">
            {systemStatuses.map((status) => (
              <AdminStatCard
                className="col-span-12 md:col-span-6 xl:col-span-4"
                key={status.label}
                label={status.label}
                meta={status.meta}
                value={status.value}
              />
            ))}
          </section>

          <Card className="p-8 xl:max-w-4xl" tone="muted">
            <h2 className="text-2xl font-semibold text-white">Monitoring note</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-400">
              The structure is standardized with the rest of the admin area and is ready to connect
              to real monitoring data later.
            </p>
          </Card>
        </>
      ) : null}
    </div>
  );
}
