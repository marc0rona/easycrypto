import type { AddressRecord } from '../../types/address';
import { AddressRow } from './AddressRow';

export interface AddressTableProps {
  addresses: AddressRecord[];
  onAddAddress: () => void;
  onDelete: (addressId: string) => void;
  onEdit: (address: AddressRecord) => void;
}

export function AddressTable({
  addresses,
  onAddAddress,
  onDelete,
  onEdit,
}: AddressTableProps) {
  if (addresses.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-14 text-center">
        <h2 className="text-2xl font-semibold text-white">No addresses yet</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-300">
          Start by adding your first crypto address so you can manage everything from one place.
        </p>
        <button
          className="mt-8 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          type="button"
          onClick={onAddAddress}
        >
          Add your first address
        </button>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-white/[0.02]">
            <tr className="text-left">
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Label
              </th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Address
              </th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Type
              </th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {addresses.map((address) => (
              <AddressRow key={address.id} address={address} onDelete={onDelete} onEdit={onEdit} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
