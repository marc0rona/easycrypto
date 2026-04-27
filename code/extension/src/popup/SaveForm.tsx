import type { FormEvent, RefObject } from 'react';

import type { CoinData } from '../utils/coingecko';
import type { DetectedCryptoType } from '../utils/detector';

interface SaveFormProps {
  address: string;
  addressErrorMessage: string | null;
  addressInputRef: RefObject<HTMLInputElement>;
  detectedCoinData: CoinData | null;
  detectedType: DetectedCryptoType | null;
  isDetectedCoinDataLoading: boolean;
  isEditing: boolean;
  isOpen: boolean;
  isSaveDisabled: boolean;
  isShakingAddressInput: boolean;
  label: string;
  loading: boolean;
  onAddressChange: (value: string) => void;
  onCancel: () => void;
  onLabelChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
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

function renderDetectionState(
  address: string,
  detectedType: DetectedCryptoType | null,
  detectedCoinData: CoinData | null,
  isDetectedCoinDataLoading: boolean,
) {
  if (!address.trim()) {
    return null;
  }

  if (detectedType && detectedCoinData) {
    return (
      <div className="feedback-banner feedback-banner--info">
        <img
          alt={`${detectedCoinData.name} logo`}
          className="soft-avatar h-8 w-8"
          height={32}
          loading="lazy"
          src={detectedCoinData.image}
          width={32}
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">{detectedCoinData.name}</p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/80">
            {detectedCoinData.symbol}
          </p>
        </div>
      </div>
    );
  }

  if (detectedType && isDetectedCoinDataLoading) {
    return (
      <div className="feedback-banner feedback-banner--loading">
        <LoadingDots label="Loading coin info" />
      </div>
    );
  }

  if (detectedType) {
    return (
      <div className="feedback-banner feedback-banner--success">
        <span className="text-sm font-semibold text-emerald-100">Detected: {detectedType}</span>
      </div>
    );
  }

  return (
    <div className="feedback-banner feedback-banner--error">
      <span className="text-sm font-semibold text-rose-100">Unknown or invalid address</span>
    </div>
  );
}

export function SaveForm({
  address,
  addressErrorMessage,
  addressInputRef,
  detectedCoinData,
  detectedType,
  isDetectedCoinDataLoading,
  isEditing,
  isOpen,
  isSaveDisabled,
  isShakingAddressInput,
  label,
  loading,
  onAddressChange,
  onCancel,
  onLabelChange,
  onSubmit,
}: SaveFormProps) {
  return (
    <section
      aria-hidden={!isOpen}
      className={`reveal-panel${isOpen ? ' reveal-panel--open' : ' reveal-panel--closed'}`}
    >
      <div className="glass-panel glass-panel--accent">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/70">
                Quick Save
              </p>
              <h2 className="text-[18px] font-semibold tracking-tight text-white">
                {isEditing ? 'Update crypto address' : 'Save a crypto address'}
              </h2>
            </div>
            {isEditing ? (
              <span className="soft-tag soft-tag--accent">
                Editing
              </span>
            ) : null}
          </div>
          <p className="max-w-[30ch] text-sm leading-6 text-slate-400">
            Paste an address and EZ-CRYPT0 will detect the network instantly before you save it.
          </p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="field-label" htmlFor="popup-label">
              Label
            </label>
            <input
              className="popup-input"
              disabled={!isOpen || loading}
              id="popup-label"
              onChange={(event) => {
                onLabelChange(event.target.value);
              }}
              placeholder="e.g. Binance Wallet"
              type="text"
              value={label}
            />
          </div>

          <div className="space-y-2">
            <label className="field-label" htmlFor="popup-address">
              Address
            </label>
            <input
              className={`popup-input${addressErrorMessage ? ' popup-input--error' : ''}${
                isShakingAddressInput ? ' popup-input--shake' : ''
              }`}
              disabled={!isOpen || loading}
              id="popup-address"
              onChange={(event) => {
                onAddressChange(event.target.value);
              }}
              placeholder="Paste your crypto address"
              ref={addressInputRef}
              type="text"
              value={address}
            />
            {addressErrorMessage ? (
              <p className="text-sm font-medium text-rose-200">{addressErrorMessage}</p>
            ) : null}
          </div>

          {renderDetectionState(address, detectedType, detectedCoinData, isDetectedCoinDataLoading)}

          <div className="flex items-center gap-3">
            <button
              className="popup-primary-button flex-1"
              disabled={isSaveDisabled}
              type="submit"
            >
              {loading ? (
                <LoadingDots label={isEditing ? 'Updating' : 'Saving'} />
              ) : isEditing ? (
                'Update Address'
              ) : (
                'Save Address'
              )}
            </button>

            {isEditing ? (
              <button className="popup-ghost-button shrink-0" onClick={onCancel} type="button">
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  );
}
