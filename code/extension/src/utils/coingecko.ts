import {
  fetchLocalMarketCoins,
  normalizeCoinSymbol,
  type LocalMarketCoin,
} from './marketApi';

export interface CoinData {
  image: string;
  name: string;
  symbol: string;
}

function toCoinData(coin: LocalMarketCoin): CoinData {
  return {
    image: coin.image,
    name: coin.name,
    symbol: coin.symbol.toUpperCase(),
  };
}

export async function getCoinData(type: string): Promise<CoinData | null> {
  const normalizedSymbol = normalizeCoinSymbol(type);

  if (!normalizedSymbol) {
    return null;
  }

  const marketCoins = await fetchLocalMarketCoins();
  const matchingCoin = marketCoins.find(
    (coin) => coin.symbol.toUpperCase() === normalizedSymbol,
  );

  return matchingCoin ? toCoinData(matchingCoin) : null;
}
