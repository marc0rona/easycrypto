import type { AddressRecord } from '../../types/address';
import type { CoinData } from '../../utils/coingecko';
import { getDisplayAddressLabel, truncateAddress } from '../../utils/detector';
import { Button } from '../ui/Button';
import { TableCell, TableRow } from '../ui/Table';

export interface AddressRowProps {
  address: AddressRecord;
  coinData?: CoinData | null;
  isCoinLoading?: boolean;
  isCopied?: boolean;
  onCopy: (address: AddressRecord) => void;
  onDelete: (address: AddressRecord) => void;
  onEdit: (address: AddressRecord) => void;
}

export function AddressRow({
  address,
  coinData,
  isCoinLoading = false,
  isCopied = false,
  onCopy,
  onDelete,
  onEdit,
}: AddressRowProps) {
  const addedAtLabel = address.createdAt
    ? new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
      }).format(new Date(address.createdAt))
    : 'Just added';

  const coinLine = coinData
    ? `${coinData.name} • ${coinData.symbol}`
    : isCoinLoading
      ? 'Loading coin info...'
      : address.type;

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/8 bg-[#0b1020]">
            {coinData?.image ? (
              <img
                alt={`${coinLine} logo`}
                className="h-8 w-8 rounded-full object-cover"
                loading="lazy"
                src={coinData.image}
              />
            ) : isCoinLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />
            ) : (
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">
                {address.type}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-white">
              {getDisplayAddressLabel(address.label)}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="truncate text-xs text-slate-400">{coinLine}</p>
              <span className="rounded-full border border-cyan-400/10 bg-cyan-400/8 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-200">
                {address.type}
              </span>
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="font-mono text-sm text-slate-300" title={address.address}>
        {truncateAddress(address.address)}
      </TableCell>
      <TableCell>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
          {address.direction === 'SENDING' ? 'Sending' : 'Receiving'}
        </span>
      </TableCell>
      <TableCell className="text-sm text-slate-400">{addedAtLabel}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={isCopied ? 'primary' : 'secondary'}
            onClick={() => onCopy(address)}
          >
            {isCopied ? 'Copied' : 'Copy'}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => onEdit(address)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => onDelete(address)}>
            Delete
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
