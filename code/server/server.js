const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE_PATH = path.join(__dirname, 'data.json');
const COINGECKO_MARKETS_URL = 'https://api.coingecko.com/api/v3/coins/markets';

const SYMBOL_TO_COINGECKO_ID = {
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
};

const COINGECKO_ID_ALIASES = {
  TON: ['the-open-network'],
};

const SELECTED_COIN_IDS = Array.from(
  new Set([
    ...Object.values(SYMBOL_TO_COINGECKO_ID),
    ...Object.entries(COINGECKO_ID_ALIASES).flatMap(([, ids]) => ids),
  ]),
);
const TEST_CRON_SCHEDULE = '* * * * *';
const DAILY_CRON_SCHEDULE = '0 0 * * *';
const ACTIVE_CRON_SCHEDULE = process.env.MARKET_CRON_SCHEDULE || DAILY_CRON_SCHEDULE;

let marketCache = readMarketDataFromDisk();

function isAllowedOrigin(origin) {
  return (
    /^chrome-extension:\/\/[a-p]{32}$/.test(origin) ||
    /^https?:\/\/localhost(?::\d+)?$/.test(origin) ||
    /^https?:\/\/127\.0\.0\.1(?::\d+)?$/.test(origin)
  );
}

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;

  if (typeof origin === 'string' && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');
  }
}

function readMarketDataFromDisk() {
  if (!fs.existsSync(DATA_FILE_PATH)) {
    fs.writeFileSync(DATA_FILE_PATH, '[]\n', 'utf8');
    return [];
  }

  try {
    const fileContents = fs.readFileSync(DATA_FILE_PATH, 'utf8');
    const parsedData = JSON.parse(fileContents);

    return Array.isArray(parsedData) ? parsedData : [];
  } catch (error) {
    console.error('Failed to read data.json:', error.message);
    return [];
  }
}

function saveMarketDataToDisk(marketData) {
  fs.writeFileSync(DATA_FILE_PATH, `${JSON.stringify(marketData, null, 2)}\n`, 'utf8');
}

function sanitizeCoin(coin) {
  const normalizedSymbol = String(coin.symbol).toUpperCase();

  return {
    id: coin.id,
    symbol: normalizedSymbol,
    name: coin.name,
    image: coin.image,
    current_price: coin.current_price,
    price_change_percentage_24h:
      typeof coin.price_change_percentage_24h === 'number'
        ? coin.price_change_percentage_24h
        : null,
    market_cap_rank: typeof coin.market_cap_rank === 'number' ? coin.market_cap_rank : null,
  };
}

async function fetchSelectedCoinsFromCoinGecko() {
  const response = await axios.get(COINGECKO_MARKETS_URL, {
    params: {
      vs_currency: 'usd',
      ids: SELECTED_COIN_IDS.join(','),
      price_change_percentage: '24h',
      sparkline: false,
    },
    timeout: 10000,
  });

  if (!Array.isArray(response.data)) {
    throw new Error('CoinGecko returned an invalid response.');
  }

  return response.data
    .map(sanitizeCoin)
    .filter((coin, index, coins) => {
      return coins.findIndex((candidate) => candidate.symbol === coin.symbol) === index;
    })
    .sort((leftCoin, rightCoin) => {
      const leftRank =
        typeof leftCoin.market_cap_rank === 'number' ? leftCoin.market_cap_rank : Number.MAX_SAFE_INTEGER;
      const rightRank =
        typeof rightCoin.market_cap_rank === 'number' ? rightCoin.market_cap_rank : Number.MAX_SAFE_INTEGER;

      return leftRank - rightRank;
    });
}

async function refreshMarketData() {
  const marketData = await fetchSelectedCoinsFromCoinGecko();
  marketCache = marketData;
  saveMarketDataToDisk(marketData);

  console.log(
    `[market-api] Saved ${marketData.length} selected coins to ${path.basename(DATA_FILE_PATH)} at ${new Date().toISOString()}`,
  );

  return marketData;
}

app.use((req, res, next) => {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

app.get('/market', async (_req, res) => {
  if (marketCache.length === 0) {
    try {
      await refreshMarketData();
    } catch (error) {
      res.status(503).json({
        message: 'Market data is not ready yet. Start the server with internet access and try again.',
      });
      return;
    }
  }

  res.json(marketCache);
});

async function startServer() {
  try {
    await refreshMarketData();
  } catch (error) {
    console.error('[market-api] Initial CoinGecko sync failed:', error.message);
    console.error('[market-api] Serving existing data.json contents until the next successful refresh.');
  }

  cron.schedule(ACTIVE_CRON_SCHEDULE, () => {
    console.log(`[market-api] Running scheduled refresh with cron: ${ACTIVE_CRON_SCHEDULE}`);

    refreshMarketData().catch((error) => {
      console.error('[market-api] Scheduled refresh failed:', error.message);
    });
  });

  app.listen(PORT, () => {
    console.log(`[market-api] Server running at http://localhost:${PORT}`);
    console.log(`[market-api] GET http://localhost:${PORT}/market`);
    console.log(`[market-api] Active cron schedule: ${ACTIVE_CRON_SCHEDULE}`);
    console.log(`[market-api] Test every minute with: MARKET_CRON_SCHEDULE="${TEST_CRON_SCHEDULE}" node server.js`);
  });
}

startServer();
