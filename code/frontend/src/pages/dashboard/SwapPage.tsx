import { useCallback, useEffect, useMemo, useState } from 'react';

import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/ErrorState';
import { Input } from '../../components/ui/Input';
import { Loader } from '../../components/ui/Loader';
import { ADDRESS_TYPES, type AddressType } from '../../types/address';
import { fetchLocalMarketCoins, type LocalMarketCoin } from '../../utils/marketApi';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    maximumFractionDigits: value >= 1000 ? 0 : 2,
    style: 'currency',
  }).format(value);
}

function formatChange(value: number | null) {
  if (value === null) {
    return 'No change';
  }

  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(2)}%`;
}

function isValidAmountInput(value: string) {
  return value === '' || /^\d*\.?\d*$/.test(value);
}

export function SwapPage() {
  const [amount, setAmount] = useState('1');
  const [coins, setCoins] = useState<LocalMarketCoin[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState<AddressType>('BTC');

  const loadCoins = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await fetchLocalMarketCoins();
      setCoins(result.filter((coin) => ADDRESS_TYPES.includes(coin.symbol.toUpperCase() as AddressType)));
    } catch (error) {
      console.error('Failed to load swap quote data.', error);
      setErrorMessage('Unable to load conversion quotes right now.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCoins();
  }, [loadCoins]);

  const activeCoin = useMemo(
    () => coins.find((coin) => coin.symbol.toUpperCase() === selectedSymbol) ?? null,
    [coins, selectedSymbol],
  );

  const parsedAmount = Number(amount);
  const hasAmount = amount.trim() !== '' && Number.isFinite(parsedAmount) && parsedAmount >= 0;
  const usdQuote =
    activeCoin && hasAmount ? parsedAmount * activeCoin.current_price : null;

  return (
    <div className="layout-stack-xl pb-4">
      <DashboardHeader
        eyebrow="Conversion tool"
        subtitle="Use Swap as a fast crypto-to-USD quote tool only. EZ-CRYPT0 does not execute swaps, hold funds, or move assets on-chain."
        title="Swap quote"
      />

      {isLoading ? (
        <Card className="p-0">
          <Loader message="Loading conversion data..." />
        </Card>
      ) : errorMessage ? (
        <ErrorState
          message={errorMessage}
          onRetry={() => {
            void loadCoins();
          }}
        />
      ) : (
        <section className="layout-grid-12">
          <Card className="col-span-12 p-8 xl:col-span-7 xl:p-10">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                Quick quote
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">
                Convert crypto to USD without leaving the workspace
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                Pick a supported network, enter an amount, and EZ-CRYPT0 will show the latest USD
                quote from the same market feed used across the extension companion.
              </p>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Amount
                </span>
                <Input
                  autoComplete="off"
                  inputMode="decimal"
                  placeholder="Enter amount"
                  type="text"
                  value={amount}
                  onChange={(event) => {
                    const nextValue = event.target.value;

                    if (!isValidAmountInput(nextValue)) {
                      return;
                    }

                    setAmount(nextValue);
                  }}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Asset
                </span>
                <select
                  className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-all duration-200 focus:border-cyan-400/70 focus:outline-none focus:ring-4 focus:ring-cyan-400/10"
                  value={selectedSymbol}
                  onChange={(event) => {
                    setSelectedSymbol(event.target.value as AddressType);
                  }}
                >
                  {coins.map((coin) => (
                    <option key={coin.id} value={coin.symbol.toUpperCase()}>
                      {coin.name} ({coin.symbol.toUpperCase()})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <Card className="mt-8 p-6" tone="accent">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                USD quote
              </p>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-white">
                {usdQuote !== null ? formatCurrency(usdQuote) : 'Enter an amount'}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                Based on the current price of {activeCoin?.name ?? selectedSymbol}. This is a reference
                quote only, not an executable swap.
              </p>
            </Card>
          </Card>

          <div className="col-span-12 space-y-5 xl:col-span-5">
            <Card className="p-7" tone="muted">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Selected asset
              </p>
              {activeCoin ? (
                <div className="mt-5 flex items-center gap-4">
                  <img
                    alt={`${activeCoin.name} logo`}
                    className="h-14 w-14 rounded-full object-cover"
                    loading="lazy"
                    src={activeCoin.image}
                  />
                  <div>
                    <p className="text-2xl font-semibold text-white">{activeCoin.name}</p>
                    <p className="mt-1 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
                      {activeCoin.symbol.toUpperCase()}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/[0.03] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Price</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {activeCoin ? formatCurrency(activeCoin.current_price) : 'Unavailable'}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/[0.03] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">24h</p>
                  <p
                    className={[
                      'mt-2 text-lg font-semibold',
                      activeCoin?.price_change_percentage_24h !== null &&
                      (activeCoin?.price_change_percentage_24h ?? 0) >= 0
                        ? 'text-emerald-300'
                        : 'text-rose-300',
                    ].join(' ')}
                  >
                    {activeCoin ? formatChange(activeCoin.price_change_percentage_24h) : 'Unavailable'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Quick picks
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {ADDRESS_TYPES.map((type) => (
                  <Button
                    key={type}
                    size="sm"
                    variant={selectedSymbol === type ? 'primary' : 'secondary'}
                    onClick={() => {
                      setSelectedSymbol(type);
                    }}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
