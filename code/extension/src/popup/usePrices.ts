import { useEffect, useState } from 'react';

export type SwapAssetSymbol = 'BNB' | 'BTC' | 'ETH' | 'SOL';

export interface SwapAssetDefinition {
  coingeckoId: string;
  name: string;
  symbol: SwapAssetSymbol;
}

interface CoinGeckoSimplePriceResponse {
  [coinId: string]: {
    usd?: unknown;
  };
}

interface PricesHookState {
  error: string | null;
  isLoading: boolean;
  pricesBySymbol: Partial<Record<SwapAssetSymbol, number>>;
}

export const SWAP_ASSETS: readonly SwapAssetDefinition[] = [
  {
    coingeckoId: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
  },
  {
    coingeckoId: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
  },
  {
    coingeckoId: 'solana',
    name: 'Solana',
    symbol: 'SOL',
  },
  {
    coingeckoId: 'binancecoin',
    name: 'BNB',
    symbol: 'BNB',
  },
] as const;

export const SWAP_PRICE_ITEM_COUNT = SWAP_ASSETS.length;

const COINGECKO_SIMPLE_PRICE_URL = `https://api.coingecko.com/api/v3/simple/price?ids=${SWAP_ASSETS.map(
  (asset) => asset.coingeckoId,
).join(',')}&vs_currencies=usd`;
const PRICES_CACHE_TTL_MS = 60_000;

let cachedPricesBySymbol: Partial<Record<SwapAssetSymbol, number>> | null = null;
let cachedAt = 0;
let inflightFetch: Promise<Partial<Record<SwapAssetSymbol, number>>> | null = null;

function parsePrices(
  responseBody: CoinGeckoSimplePriceResponse,
): Partial<Record<SwapAssetSymbol, number>> {
  return SWAP_ASSETS.reduce<Partial<Record<SwapAssetSymbol, number>>>((prices, asset) => {
    const usdValue = responseBody[asset.coingeckoId]?.usd;

    if (typeof usdValue === 'number' && Number.isFinite(usdValue) && usdValue > 0) {
      prices[asset.symbol] = usdValue;
    }

    return prices;
  }, {});
}

async function fetchPrices(): Promise<Partial<Record<SwapAssetSymbol, number>>> {
  const response = await fetch(COINGECKO_SIMPLE_PRICE_URL);

  if (!response.ok) {
    throw new Error('Failed to load live prices');
  }

  const responseBody = (await response.json()) as CoinGeckoSimplePriceResponse;
  const prices = parsePrices(responseBody);

  if (!Object.keys(prices).length) {
    throw new Error('No pricing data available');
  }

  cachedPricesBySymbol = prices;
  cachedAt = Date.now();

  return prices;
}

function getPrices(): Promise<Partial<Record<SwapAssetSymbol, number>>> {
  if (cachedPricesBySymbol && Date.now() - cachedAt < PRICES_CACHE_TTL_MS) {
    return Promise.resolve(cachedPricesBySymbol);
  }

  if (inflightFetch) {
    return inflightFetch;
  }

  inflightFetch = fetchPrices().finally(() => {
    inflightFetch = null;
  });

  return inflightFetch;
}

export function usePrices(enabled: boolean): PricesHookState {
  const [pricesBySymbol, setPricesBySymbol] = useState<Partial<Record<SwapAssetSymbol, number>>>(
    cachedPricesBySymbol ?? {},
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let isActive = true;

    if (cachedPricesBySymbol && Date.now() - cachedAt < PRICES_CACHE_TTL_MS) {
      setPricesBySymbol(cachedPricesBySymbol);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    void getPrices()
      .then((nextPrices) => {
        if (!isActive) {
          return;
        }

        setPricesBySymbol(nextPrices);
      })
      .catch((nextError: unknown) => {
        if (!isActive) {
          return;
        }

        setError(nextError instanceof Error ? nextError.message : 'Failed to load live prices');
      })
      .finally(() => {
        if (!isActive) {
          return;
        }

        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [enabled]);

  return {
    error,
    isLoading,
    pricesBySymbol,
  };
}
