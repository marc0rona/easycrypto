# Local Market API

This folder contains the small local API used by the Chrome extension.

It does 3 things:

1. Fetches only your selected coins from CoinGecko
2. Saves the cleaned result into `data.json`
3. Exposes the data at `http://localhost:3000/market`

## Coins Used

Symbols:

- `ETH`
- `BTC`
- `ADA`
- `DOGE`
- `XRP`
- `SOL`
- `LTC`
- `TON`
- `DOT`
- `TRX`
- `ATOM`

CoinGecko IDs:

- `ethereum`
- `bitcoin`
- `cardano`
- `dogecoin`
- `ripple`
- `solana`
- `litecoin`
- `toncoin`
- `polkadot`
- `tron`
- `cosmos`

Note:
CoinGecko currently returns TON market data under the ID `the-open-network`, so the server includes a fallback alias to keep TON in the response.

## Files

- `server.js`: starts the API server and cron job
- `data.json`: cached market data used by the API
- `package.json`: local server dependencies

## Install

Open a terminal in this folder:

```bash
cd /Users/driss/Desktop/Computer\ science/Implimentation/easycrypto/code/server
npm install
```

## Run The Server

```bash
cd /Users/driss/Desktop/Computer\ science/Implimentation/easycrypto/code/server
node server.js
```

When it starts, the API will be available at:

```txt
http://localhost:3000/market
```

## Test The API

In another terminal:

```bash
curl http://localhost:3000/market
```

You should get an array of coins with only these fields:

- `id`
- `symbol`
- `name`
- `image`
- `current_price`
- `price_change_percentage_24h`
- `market_cap_rank`

## Test Cron Every Minute First

Use this while testing:

```bash
cd /Users/driss/Desktop/Computer\ science/Implimentation/easycrypto/code/server
MARKET_CRON_SCHEDULE="* * * * *" node server.js
```

This refreshes the data every minute.

## Change Back To Every 24 Hours

Use the normal command:

```bash
cd /Users/driss/Desktop/Computer\ science/Implimentation/easycrypto/code/server
node server.js
```

The default cron schedule in `server.js` is:

```txt
0 0 * * *
```

## How The Symbol Map Works

Inside `server.js`, symbols are mapped like this:

```js
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
```

This means:

- `ETH` becomes `ethereum`
- `BTC` becomes `bitcoin`
- `ADA` becomes `cardano`
- and so on

## Use It In The Extension

Your extension can call:

```js
fetch("http://localhost:3000/market")
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
  });
```

## Important

- This server fetches only your selected coins
- It does not fetch all CoinGecko coins
- It saves cleaned data to `server/data.json`
- The extension reads from the local API, not directly from CoinGecko for market data
