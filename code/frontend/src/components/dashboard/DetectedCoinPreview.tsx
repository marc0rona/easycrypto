import type { CoinData } from '../../utils/coingecko';

export interface DetectedCoinPreviewProps {
  coinData: CoinData | null;
  detectedType: string | null;
  hasAddressInput: boolean;
  isLoading: boolean;
}

export function DetectedCoinPreview({
  coinData,
  detectedType,
  hasAddressInput,
  isLoading,
}: DetectedCoinPreviewProps) {
  return (
    <div className="rounded-lg bg-[#eef1f3] px-4 py-4">
      {detectedType && coinData ? (
        <div className="flex items-center gap-4">
          <img
            alt={`${coinData.name} logo`}
            className="h-12 w-12 rounded-full object-cover"
            loading="lazy"
            src={coinData.image}
          />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-[#2c2f31]">{coinData.name}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#5b636f]">
              {coinData.symbol}
            </p>
          </div>
        </div>
      ) : detectedType && isLoading ? (
        <div className="flex items-center gap-3">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#0052d0]/20 border-t-[#0052d0]" />
          <p className="text-sm font-medium text-[#595c5e]">Loading coin info...</p>
        </div>
      ) : detectedType ? (
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xs font-bold uppercase text-[#2c2f31] shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
            {detectedType}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#2c2f31]">Detected automatically</p>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#5b636f]">{detectedType}</p>
          </div>
        </div>
      ) : hasAddressInput ? (
        <p className="text-sm font-medium text-[#b31b25]">Unknown or invalid address</p>
      ) : (
        <p className="text-sm font-medium text-[#595c5e]">
          The network is detected automatically once you paste a valid wallet address.
        </p>
      )}
    </div>
  );
}
