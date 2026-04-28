import type { CoinData } from '../utils/coingecko';
import type { SwapAssetDefinition, SwapAssetSymbol } from './usePrices';

export interface CurrencyOption extends SwapAssetDefinition {
  coinData: CoinData | null;
}

interface CurrencyAvatarProps {
  coinData: CoinData | null;
  symbol: string;
}

interface CurrencySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (symbol: SwapAssetSymbol) => void;
  options: CurrencyOption[];
  selectedSymbol: SwapAssetSymbol;
}

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function CurrencyAvatar({ coinData, symbol }: CurrencyAvatarProps) {
  if (coinData?.image) {
    return (
      <img
        alt={`${coinData.name} logo`}
        className="swap-asset-avatar"
        height={40}
        loading="lazy"
        src={coinData.image}
        width={40}
      />
    );
  }

  return (
    <span className="swap-asset-avatar swap-asset-avatar--fallback">
      {symbol.slice(0, 1)}
    </span>
  );
}

export function CurrencySelector({
  isOpen,
  onClose,
  onSelect,
  options,
  selectedSymbol,
}: CurrencySelectorProps) {
  return (
    <div
      aria-hidden={!isOpen}
      className={classNames('swap-selector', isOpen && 'swap-selector--open')}
    >
      <button
        aria-label="Close currency selector"
        className="swap-selector__scrim"
        onClick={onClose}
        tabIndex={isOpen ? 0 : -1}
        type="button"
      />

      <div
        aria-modal="true"
        className="swap-selector__dialog"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200/70">
              Select Asset
            </p>
            <h3 className="text-base font-semibold tracking-tight text-white">
              Choose a crypto
            </h3>
          </div>

          <button className="popup-ghost-button popup-ghost-button--sm" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <div className="space-y-2">
          {options.map((option) => {
            const isSelected = option.symbol === selectedSymbol;
            const displayName = option.coinData?.name ?? option.name;
            const displaySymbol = option.coinData?.symbol ?? option.symbol;

            return (
              <button
                className={classNames(
                  'swap-selector__item',
                  isSelected && 'swap-selector__item--active',
                )}
                key={option.symbol}
                onClick={() => {
                  onSelect(option.symbol);
                  onClose();
                }}
                type="button"
              >
                <div className="flex items-center gap-3">
                  <CurrencyAvatar coinData={option.coinData} symbol={option.symbol} />
                  <div className="min-w-0 text-left">
                    <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {displaySymbol}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100/80">
                  {isSelected ? 'Selected' : 'Use'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
