import { MarketItem } from './MarketItem';
import { useMarketData } from './useMarketData';

interface MarketPanelProps {
  isOpen: boolean;
  limit?: number;
}

function MarketSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div className="market-item market-item--skeleton" key={index}>
          <div className="market-item__row">
            <div className="market-item__identity">
              <div className="skeleton-block h-6 w-11 rounded-full" />
              <div className="skeleton-block h-10 w-10 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2.5">
                <div className="skeleton-block h-4 w-28 rounded-full" />
                <div className="skeleton-block h-3 w-32 rounded-full" />
              </div>
            </div>
            <div className="space-y-2 text-right">
              <div className="skeleton-block ml-auto h-4 w-20 rounded-full" />
              <div className="skeleton-block ml-auto h-3 w-14 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MarketPanel({ isOpen, limit }: MarketPanelProps) {
  const { error, isLoading, marketCoins } = useMarketData(isOpen);
  const visibleMarketCoins = typeof limit === 'number' ? marketCoins.slice(0, limit) : marketCoins;

  return (
    <div aria-hidden={!isOpen} className="space-y-3">
      {isLoading ? <MarketSkeleton /> : null}

      {!isLoading && error ? (
        <p className="feedback-banner feedback-banner--error">{error}</p>
      ) : null}

      {!isLoading && !error && visibleMarketCoins.length > 0 ? (
        <div className="market-list">
          {visibleMarketCoins.map((coin) => (
            <MarketItem coin={coin} key={coin.id} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
