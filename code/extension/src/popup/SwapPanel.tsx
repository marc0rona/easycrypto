import { useEffect, useMemo, useRef, useState } from 'react';

import { getCoinData, type CoinData } from '../utils/coingecko';
import { CurrencyAvatar, CurrencySelector } from './CurrencySelector';
import { SWAP_ASSETS, usePrices, type SwapAssetSymbol } from './usePrices';

interface SwapPanelProps {
  isOpen: boolean;
}

type SwapDirection = 'crypto-to-usd' | 'usd-to-crypto';

const DEFAULT_SWAP_ASSET: SwapAssetSymbol = 'ETH';

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function sanitizeAmountInput(value: string): string {
  const strippedValue = value.replace(/,/g, '').replace(/[^\d.]/g, '');
  const [wholePart, ...decimalParts] = strippedValue.split('.');
  const joinedDecimals = decimalParts.join('');
  const normalizedWholePart =
    wholePart.length > 1 && !wholePart.includes('.') ? wholePart.replace(/^0+(?=\d)/, '') : wholePart;
  const normalizedValue = `${normalizedWholePart}${decimalParts.length ? `.${joinedDecimals}` : ''}`;

  if (normalizedValue.startsWith('.')) {
    return `0${normalizedValue}`;
  }

  if (normalizedValue === '0') {
    return '0';
  }

  return normalizedValue;
}

function parseAmount(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return null;
  }

  return parsedValue;
}

function formatUsd(value: number): string {
  const shouldUseSubDollarPrecision = value > 0 && value < 1;

  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    maximumFractionDigits: shouldUseSubDollarPrecision ? 4 : 2,
    minimumFractionDigits: shouldUseSubDollarPrecision ? 4 : 2,
    style: 'currency',
  }).format(value);
}

function formatCrypto(value: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: value >= 1 ? 6 : 8,
    minimumFractionDigits: value >= 1 ? 2 : 4,
  }).format(value);
}

function formatEditableAmount(value: number, kind: 'crypto' | 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: kind === 'usd' ? 2 : value >= 1 ? 6 : 8,
    useGrouping: false,
  }).format(value);
}

function LoadingDots({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span>{label}</span>
      <span className="loading-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </span>
  );
}

export function SwapPanel({ isOpen }: SwapPanelProps) {
  const amountInputRef = useRef<HTMLInputElement>(null);
  const pendingMetadataRef = useRef(new Set<SwapAssetSymbol>());

  const [direction, setDirection] = useState<SwapDirection>('crypto-to-usd');
  const [selectedAsset, setSelectedAsset] = useState<SwapAssetSymbol>(DEFAULT_SWAP_ASSET);
  const [amount, setAmount] = useState('');
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [assetCoinData, setAssetCoinData] = useState<Partial<Record<SwapAssetSymbol, CoinData | null>>>({});

  const { error, isLoading, pricesBySymbol } = usePrices(isOpen);

  const selectedAssetPrice = pricesBySymbol[selectedAsset] ?? null;
  const sanitizedAmount = useMemo(() => sanitizeAmountInput(amount), [amount]);
  const parsedAmount = parseAmount(sanitizedAmount);
  const isCryptoInput = direction === 'crypto-to-usd';
  const displayAmount = amount.startsWith('.') ? `0${amount}` : amount;

  const convertedAmount = useMemo(() => {
    if (parsedAmount === null || !selectedAssetPrice || selectedAssetPrice === 0) {
      return null;
    }

    const result = isCryptoInput ? parsedAmount * selectedAssetPrice : parsedAmount / selectedAssetPrice;

    return Number.isFinite(result) ? result : null;
  }, [isCryptoInput, parsedAmount, selectedAssetPrice]);

  const swapOptions = useMemo(
    () =>
      SWAP_ASSETS.map((asset) => ({
        ...asset,
        coinData: assetCoinData[asset.symbol] ?? null,
      })),
    [assetCoinData],
  );

  const selectedOption = useMemo(
    () => swapOptions.find((asset) => asset.symbol === selectedAsset) ?? swapOptions[0],
    [selectedAsset, swapOptions],
  );

  useEffect(() => {
    if (!isOpen) {
      setIsSelectorOpen(false);
      return;
    }

    const focusTimer = window.setTimeout(() => {
      amountInputRef.current?.focus();
    }, 180);

    return () => {
      window.clearTimeout(focusTimer);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    for (const asset of SWAP_ASSETS) {
      if (assetCoinData[asset.symbol] !== undefined || pendingMetadataRef.current.has(asset.symbol)) {
        continue;
      }

      pendingMetadataRef.current.add(asset.symbol);

      void getCoinData(asset.symbol)
        .then((nextCoinData) => {
          setAssetCoinData((currentState) => ({
            ...currentState,
            [asset.symbol]: nextCoinData,
          }));
        })
        .catch(() => {
          setAssetCoinData((currentState) => ({
            ...currentState,
            [asset.symbol]: null,
          }));
        })
        .finally(() => {
          pendingMetadataRef.current.delete(asset.symbol);
        });
    }
  }, [assetCoinData, isOpen]);

  function handleAmountChange(nextValue: string) {
    const normalizedValue = nextValue.replace(/,/g, '');

    if (!/^\d*\.?\d*$/.test(normalizedValue)) {
      return;
    }

    setAmount(normalizedValue);
  }

  function handleSwitchDirection() {
    const nextDirection: SwapDirection =
      direction === 'crypto-to-usd' ? 'usd-to-crypto' : 'crypto-to-usd';

    if (convertedAmount !== null) {
      setAmount(formatEditableAmount(convertedAmount, nextDirection === 'crypto-to-usd' ? 'crypto' : 'usd'));
    }

    setDirection(nextDirection);
  }

  const quoteLine = selectedAssetPrice
    ? `1 ${selectedAsset} ≈ ${formatUsd(selectedAssetPrice)}`
    : null;

  const defaultOutputValue = isCryptoInput ? '$0.00' : `0.0000 ${selectedAsset}`;
  const outputValue =
    convertedAmount === null || !Number.isFinite(convertedAmount)
      ? defaultOutputValue
      : isCryptoInput
        ? formatUsd(convertedAmount)
        : `${formatCrypto(convertedAmount)} ${selectedAsset}`;

  const selectorLabel = selectedOption?.coinData?.name ?? selectedOption?.name ?? selectedAsset;
  const selectorSymbol = selectedOption?.coinData?.symbol ?? selectedAsset;

  return (
    <section
      aria-hidden={!isOpen}
      className={`reveal-panel${isOpen ? ' reveal-panel--open' : ' reveal-panel--closed'}`}
    >
      <div className="workspace-panel workspace-panel--swap swap-panel">
        <div className="swap-panel__header">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/70">
            Swap
          </p>
          {!isLoading && !error && quoteLine ? (
            <span className="swap-quote-pill">{quoteLine}</span>
          ) : null}
        </div>

        {isLoading ? (
          <p className="swap-status-line">
            <LoadingDots label="Live quote" />
          </p>
        ) : null}

        {!isLoading && error ? <p className="swap-status-line swap-status-line--error">{error}</p> : null}

        <div className="swap-stack">
          <div className="swap-field">
            <div className="swap-field__top">
              <p className="swap-field__eyebrow">You pay</p>

              {isCryptoInput ? (
                <button
                  className="swap-asset-button"
                  onClick={() => {
                    setIsSelectorOpen(true);
                  }}
                  type="button"
                >
                  <div className="flex items-center gap-2.5">
                    <CurrencyAvatar coinData={selectedOption?.coinData ?? null} symbol={selectedAsset} />
                    <div className="min-w-0 text-left">
                      <p className="truncate text-sm font-semibold text-white">{selectorLabel}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {selectorSymbol}
                      </p>
                    </div>
                  </div>
                  <span className="swap-chevron" aria-hidden="true">
                    ▾
                  </span>
                </button>
              ) : (
                <span className="swap-static-pill">USD</span>
              )}
            </div>

            <div className="swap-field__center">
              <input
                autoComplete="off"
                className="swap-amount-input"
                inputMode="decimal"
                onChange={(event) => {
                  handleAmountChange(event.target.value);
                }}
                onInput={(event) => {
                  handleAmountChange((event.target as HTMLInputElement).value);
                }}
                placeholder="Enter amount"
                ref={amountInputRef}
                spellCheck={false}
                type="text"
                value={displayAmount}
              />
            </div>

            <div className="swap-field__bottom">
              <p className="swap-field__meta">
                {isCryptoInput ? `${selectedAsset} input` : 'USD input'}
              </p>
            </div>
          </div>

          <div className="swap-divider">
            <span className="swap-divider__line" aria-hidden="true" />
            <button className="swap-switch-button" onClick={handleSwitchDirection} type="button">
              <span className="sr-only">Switch conversion direction</span>
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
                viewBox="0 0 24 24"
              >
                <path d="M7 7h10" />
                <path d="m13.75 3.75 3.5 3.25-3.5 3.25" />
                <path d="M17 17H7" />
                <path d="m10.25 20.25-3.5-3.25 3.5-3.25" />
              </svg>
            </button>
            <span className="swap-divider__line" aria-hidden="true" />
          </div>

          <div className="swap-field swap-field--output">
            <div className="swap-field__top">
              <p className="swap-field__eyebrow">You receive</p>
              {isCryptoInput ? (
                <span className="swap-static-pill">USD</span>
              ) : (
                <button
                  className="swap-asset-button swap-asset-button--secondary"
                  onClick={() => {
                    setIsSelectorOpen(true);
                  }}
                  type="button"
                >
                  <div className="flex items-center gap-2.5">
                    <CurrencyAvatar coinData={selectedOption?.coinData ?? null} symbol={selectedAsset} />
                    <div className="min-w-0 text-left">
                      <p className="truncate text-sm font-semibold text-white">{selectorLabel}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {selectorSymbol}
                      </p>
                    </div>
                  </div>
                  <span className="swap-chevron" aria-hidden="true">
                    ▾
                  </span>
                </button>
              )}
            </div>

            <div className="swap-field__center">
              <p className={classNames('swap-amount-output', !selectedAssetPrice && 'swap-amount-output--muted')}>
                {outputValue}
              </p>
            </div>

            <div className="swap-field__bottom">
              <p className="swap-field__meta">
                {isCryptoInput ? 'USD output' : `${selectedAsset} output`}
              </p>
              {!isLoading && !error && quoteLine ? (
                <span className="swap-field__meta swap-field__meta--accent">Live</span>
              ) : null}
            </div>
          </div>
        </div>

        {!isLoading && !error && quoteLine ? (
          <div className="swap-footnote">
            <span className="swap-footnote__dot" aria-hidden="true" />
            <p>{quoteLine}</p>
          </div>
        ) : null}

        <CurrencySelector
          isOpen={isSelectorOpen}
          onClose={() => {
            setIsSelectorOpen(false);
          }}
          onSelect={setSelectedAsset}
          options={swapOptions}
          selectedSymbol={selectedAsset}
        />
      </div>
    </section>
  );
}
