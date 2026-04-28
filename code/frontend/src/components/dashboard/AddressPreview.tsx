import type { CoinData } from '../../utils/coingecko';
import { getDisplayAddressLabel, truncateAddress } from '../../utils/detector';
import { Card } from '../ui/Card';

export interface AddressPreviewProps {
  address: string;
  coinData?: CoinData | null;
  createdAtLabel?: string;
  direction: 'RECEIVING' | 'SENDING';
  label?: string;
  type: string;
}

export function AddressPreview({
  address,
  coinData,
  createdAtLabel,
  direction,
  label,
  type,
}: AddressPreviewProps) {
  const coinLine = coinData ? `${coinData.name} • ${coinData.symbol}` : type;

  return (
    <Card className="p-5" tone="muted">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-xl border border-cyan-400/15 bg-cyan-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              {type}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
              {direction === 'SENDING' ? 'Sending view' : 'Receiving view'}
            </span>
          </div>

          <p className="mt-4 truncate text-base font-semibold text-white">
            {getDisplayAddressLabel(label)}
          </p>
          <p className="mt-2 truncate text-sm text-slate-400">{coinLine}</p>
          <p className="mt-3 truncate font-mono text-sm text-slate-300" title={address}>
            {truncateAddress(address)}
          </p>
        </div>

        <span className="text-right text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
          {createdAtLabel ?? 'Saved'}
        </span>
      </div>
    </Card>
  );
}
