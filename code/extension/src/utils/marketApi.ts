export const LOCAL_MARKET_API_URL = 'http://localhost:3000/market';
export const MARKET_CACHE_TTL_MS = 60_000;

export const COINGECKO_ID_BY_SYMBOL = {
  ETH: 'ethereum',
  BTC: 'bitcoin',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  XRP: 'ripple',
  SOL: 'solana',
  LTC: 'litecoin',
  TON: 'toncoin',
  DOT: 'polkadot',
  TRX: 'tron',
  ATOM: 'cosmos',
} as const;

export type SupportedCoinSymbol = keyof typeof COINGECKO_ID_BY_SYMBOL;

export interface LocalMarketCoin {
  current_price: number;
  id: string;
  image: string;
  market_cap_rank: number | null;
  name: string;
  price_change_percentage_24h: number | null;
  symbol: string;
}

let cachedMarketCoins: LocalMarketCoin[] | null = null;
let cachedAt = 0;

function isLocalMarketCoin(value: unknown): value is LocalMarketCoin {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<LocalMarketCoin>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.image === 'string' &&
    (typeof candidate.market_cap_rank === 'number' || candidate.market_cap_rank === null) &&
    typeof candidate.name === 'string' &&
    (typeof candidate.price_change_percentage_24h === 'number' ||
      candidate.price_change_percentage_24h === null) &&
    typeof candidate.symbol === 'string' &&
    typeof candidate.current_price === 'number'
  );
}

export function normalizeCoinSymbol(symbol: string): SupportedCoinSymbol | null {
  const normalizedSymbol = symbol.trim().toUpperCase();

  if (!(normalizedSymbol in COINGECKO_ID_BY_SYMBOL)) {
    return null;
  }

  return normalizedSymbol as SupportedCoinSymbol;
}

export async function fetchLocalMarketCoins(
  forceRefresh = false,
  signal?: AbortSignal,
): Promise<LocalMarketCoin[]> {
  if (!forceRefresh && cachedMarketCoins && Date.now() - cachedAt < MARKET_CACHE_TTL_MS) {
    return cachedMarketCoins;
  }

  const response = await fetch(LOCAL_MARKET_API_URL, {
    signal,
  });

  if (!response.ok) {
    throw new Error('Failed to load local market data');
  }

  const responseBody = (await response.json()) as unknown;

  if (!Array.isArray(responseBody)) {
    throw new Error('Invalid local market response');
  }

  const marketCoins = responseBody.filter(isLocalMarketCoin);

  cachedMarketCoins = marketCoins;
  cachedAt = Date.now();

  return marketCoins;
}
