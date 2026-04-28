export const env = {
  appName: 'EZ-CRYPT0',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL?.trim() || '/api/v1',
  marketApiUrl: import.meta.env.VITE_MARKET_API_URL?.trim() || 'http://localhost:3000/market',
} as const;
