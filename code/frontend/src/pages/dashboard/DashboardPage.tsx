import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getAddresses } from '../../api/address.api';
import { AddressPreview } from '../../components/dashboard/AddressPreview';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { StatCard } from '../../components/dashboard/StatCard';
import { Loader } from '../../components/ui/Loader';
import type { AddressRecord } from '../../types/address';

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong while loading your dashboard.';
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<AddressRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadAddresses = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await getAddresses();
      setAddresses(result);
    } catch (error) {
      console.error('Failed to load dashboard addresses.', error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAddresses();
  }, [loadAddresses]);

  const handleAddAddress = useCallback(() => {
    navigate('/dashboard/addresses');
  }, [navigate]);

  const handleViewAllAddresses = useCallback(() => {
    navigate('/dashboard/addresses');
  }, [navigate]);

  const recentAddresses = useMemo(() => addresses.slice(0, 4), [addresses]);
  const trackedNetworksCount = useMemo(
    () => new Set(addresses.map((address) => address.type)).size,
    [addresses],
  );
  const stats = useMemo(
    () => [
      {
        label: 'Total addresses',
        value: String(addresses.length),
        meta: 'Across your saved workspace',
      },
      {
        label: 'Recent addresses',
        value: String(recentAddresses.length),
        meta: 'Shown in your latest preview',
      },
      {
        label: 'Tracked networks',
        value: String(trackedNetworksCount),
        meta: 'Unique address types currently saved',
      },
    ],
    [addresses.length, recentAddresses.length, trackedNetworksCount],
  );

  return (
    <div className="space-y-8">
      <DashboardHeader
        subtitle="Manage your crypto addresses in one place"
        title="Dashboard"
      />

      {isLoading ? (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03]">
          <Loader message="Loading..." />
        </section>
      ) : null}

      {!isLoading && errorMessage ? (
        <section className="rounded-3xl border border-rose-400/20 bg-rose-400/10 p-6">
          <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-rose-100">{errorMessage}</p>
          <button
            className="mt-5 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
            type="button"
            onClick={() => {
              void loadAddresses();
            }}
          >
            Retry
          </button>
        </section>
      ) : null}

      {!isLoading && !errorMessage ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.label} label={stat.label} meta={stat.meta} value={stat.value} />
          ))}
        </section>
      ) : null}

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Quick actions</h2>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Jump straight into the most common address management tasks.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              type="button"
              onClick={handleAddAddress}
            >
              Add Address
            </button>
            <button
              className="rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              type="button"
              onClick={handleViewAllAddresses}
            >
              View All Addresses
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Recent addresses</h2>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              A quick preview of the latest addresses saved to your workspace.
            </p>
          </div>
        </div>

        {isLoading ? <Loader message="Loading..." /> : null}

        {!isLoading && !errorMessage && recentAddresses.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-10 text-center">
            <p className="text-lg font-semibold text-white">No addresses yet</p>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-300">
              Add your first address to start building your crypto workspace.
            </p>
            <button
              className="mt-6 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              type="button"
              onClick={handleAddAddress}
            >
              Add your first address
            </button>
          </div>
        ) : null}

        {!isLoading && !errorMessage && recentAddresses.length > 0 ? (
          <div className="mt-6 space-y-4">
            {recentAddresses.map((address) => (
              <AddressPreview
                key={address.id}
                address={address.address}
                label={address.label}
                type={address.type}
              />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
