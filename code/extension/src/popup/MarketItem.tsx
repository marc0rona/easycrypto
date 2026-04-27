import type { LocalMarketCoin } from '../utils/marketApi';

interface MarketItemProps {
  coin: LocalMarketCoin;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 2,
  style: 'currency',
});

function formatPrice(price: number): string {
  if (price >= 1000) {
    return currencyFormatter.format(price);
  }

  if (price >= 1) {
    return new Intl.NumberFormat('en-US', {
      currency: 'USD',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      style: 'currency',
    }).format(price);
  }

  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    maximumFractionDigits: 6,
    minimumFractionDigits: 4,
    style: 'currency',
  }).format(price);
}

export function MarketItem({ coin }: MarketItemProps) {
  const priceChange = coin.price_change_percentage_24h;
  const isPositive = typeof priceChange === 'number' ? priceChange >= 0 : null;
  const changeClassName =
    isPositive === null
      ? 'market-item__change'
      : `market-item__change ${isPositive ? 'market-item__change--up' : 'market-item__change--down'}`;

  return (
    <article className="market-item">
      <div className="market-item__row">
        <div className="market-item__identity">
          <span className="market-rank">
            {typeof coin.market_cap_rank === 'number' ? `#${coin.market_cap_rank}` : '--'}
          </span>
          <img
            alt={`${coin.name} logo`}
            className="market-item__logo"
            height={40}
            loading="lazy"
            src={coin.image}
            width={40}
          />
          <div className="market-item__copy">
            <p className="market-item__name" title={coin.name}>
              {coin.name}
            </p>
            <p className="market-item__symbol">{coin.symbol}</p>
          </div>
        </div>

        <div className="market-item__pricing">
          <p className="market-item__price">{formatPrice(coin.current_price)}</p>
          <p className={changeClassName}>
            <span className="tabular-nums">
              {typeof priceChange === 'number'
                ? `${isPositive ? '+' : ''}${priceChange.toFixed(2)}%`
                : '--'}
            </span>
          </p>
        </div>
      </div>
    </article>
  );
}
