import type { FormEvent, ReactNode, RefObject } from 'react';

import type { CoinData } from '../utils/coingecko';
import type { DetectedCryptoType } from '../utils/detector';

type AddressDirection = 'RECEIVING' | 'SENDING';

interface SaveScreenProps {
  address: string;
  addressErrorMessage: string | null;
  addressInputRef: RefObject<HTMLInputElement>;
  detectedCoinData: CoinData | null;
  detectedType: DetectedCryptoType | null;
  direction: AddressDirection;
  headerAction: ReactNode;
  isDetectedCoinDataLoading: boolean;
  isEditing: boolean;
  isSaveDisabled: boolean;
  isShakingAddressInput: boolean;
  label: string;
  loading: boolean;
  onAddressChange: (value: string) => void;
  onBack: () => void;
  onCancel: () => void;
  onDirectionChange: (value: AddressDirection) => void;
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

export function SaveScreen({
  address,
  addressErrorMessage,
  addressInputRef,
  detectedCoinData,
  detectedType,
  direction,
  headerAction,
  isDetectedCoinDataLoading,
  isEditing,
  isSaveDisabled,
  isShakingAddressInput,
  label,
  loading,
  onAddressChange,
  onBack,
  onCancel,
  onDirectionChange,
  onLabelChange,
  onSubmit,
}: SaveScreenProps) {
  return (
    <section className="popup-screen page-app">
      <header className="page-app__header">
        <button aria-label="Back" className="page-app__back" onClick={onBack} type="button">
          <svg
            aria-hidden="true"
            fill="none"
            height="20"
            viewBox="0 0 20 20"
            width="20"
          >
            <path
              d="M12.5 4.5L7 10l5.5 5.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </button>
        <h1 className="page-app__title">Save</h1>
        {headerAction}
      </header>

      <main className="page-app__content popup-scroll">
        <div className="space-y-4">
          {isEditing ? (
            <div className="page-app__actions">
              <span className="soft-tag soft-tag--accent">Editing</span>
            </div>
          ) : null}

          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <span className="field-label">Address Direction</span>
              <div className="direction-toggle">
                {(['RECEIVING', 'SENDING'] as const).map((option) => {
                  const isActive = direction === option;

                  return (
                    <button
                      className={`direction-toggle__option${
                        isActive ? ' direction-toggle__option--active' : ''
                      }`}
                      disabled={loading}
                      key={option}
                      onClick={() => {
                        onDirectionChange(option);
                      }}
                      type="button"
                    >
                      <span className="direction-toggle__title">
                        {option === 'RECEIVING' ? 'Receiving' : 'Sending'}
                      </span>
                      <span className="direction-toggle__copy">
                        {option === 'RECEIVING' ? 'Money coming in' : 'Money going out'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="field-label" htmlFor="save-screen-label">
                Label
              </label>
              <input
                className="popup-input"
                disabled={loading}
                id="save-screen-label"
                onChange={(event) => {
                  onLabelChange(event.target.value);
                }}
                placeholder="e.g. Binance Wallet"
                type="text"
                value={label}
              />
            </div>

            <div className="space-y-2">
              <label className="field-label" htmlFor="save-screen-address">
                Address
              </label>
              <input
                className={`popup-input${addressErrorMessage ? ' popup-input--error' : ''}${
                  isShakingAddressInput ? ' popup-input--shake' : ''
                }`}
                disabled={loading}
                id="save-screen-address"
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
      </main>
    </section>
  );
}
