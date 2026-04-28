import { useEffect, useState } from 'react';

import {
  fetchLocalMarketCoins,
  type LocalMarketCoin,
} from '../utils/marketApi';

export const MARKET_ITEM_COUNT = 11;

interface MarketHookState {
  error: string | null;
  isLoading: boolean;
  marketCoins: LocalMarketCoin[];
}

async function fetchMarketCoins(signal: AbortSignal): Promise<LocalMarketCoin[]> {
  const marketCoins = await fetchLocalMarketCoins(false, signal);
  return marketCoins.slice(0, MARKET_ITEM_COUNT);
}

export function useMarketData(enabled: boolean): MarketHookState {
  const [marketCoins, setMarketCoins] = useState<LocalMarketCoin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const abortController = new AbortController();

    setIsLoading(true);
    setError(null);

    void fetchMarketCoins(abortController.signal)
      .then((nextMarketCoins) => {
        if (!abortController.signal.aborted) {
          setMarketCoins(nextMarketCoins);
        }
      })
      .catch((nextError: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        setError(
          nextError instanceof Error ? nextError.message : 'Failed to load local market data',
        );
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [enabled]);

  return {
    error,
    isLoading,
    marketCoins,
  };
}
