import type { AddressRecord } from '../../types/address';

export interface AddressRowProps {
  address: AddressRecord;
  onDelete: (addressId: string) => void;
  onEdit: (address: AddressRecord) => void;
}

function shortenAddress(address: string) {
  if (address.length <= 16) {
    return address;
  }

  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

export function AddressRow({ address, onDelete, onEdit }: AddressRowProps) {
  return (
    <tr className="border-t border-white/10">
      <td className="px-4 py-4 text-sm text-white">{address.label || 'Untitled'}</td>
      <td className="px-4 py-4 font-mono text-sm text-slate-300">{shortenAddress(address.address)}</td>
      <td className="px-4 py-4">
        <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
          {address.type}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex gap-2">
          <button
            className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.08]"
            type="button"
            onClick={() => onEdit(address)}
          >
            Edit
          </button>
          <button
            className="rounded-full border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-400/20"
            type="button"
            onClick={() => onDelete(address.id)}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
