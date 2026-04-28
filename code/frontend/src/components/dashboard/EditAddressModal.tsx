import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';

import type { CoinData } from '../../utils/coingecko';
import { getCoinData } from '../../utils/coingecko';
import {
  detectCryptoType,
  isValidCryptoAddress,
  normalizeAddress,
  normalizeAddressForComparison,
} from '../../utils/detector';
import { type AddressFormValues, type AddressRecord } from '../../types/address';
import { Modal } from '../ui/Modal';
import { DetectedCoinPreview } from './DetectedCoinPreview';

export interface EditAddressModalProps {
  address: AddressRecord | null;
  existingAddresses: AddressRecord[];
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: AddressFormValues) => Promise<void>;
  submitError?: string;
}

const emptyFormValues: AddressFormValues = {
  label: '',
  address: '',
  direction: 'RECEIVING',
  type: 'ETH',
};

const fieldLabelClassName =
  'block text-xs font-semibold uppercase tracking-[0.18em] text-[#595c5e]';

const underlineInputClassName =
  'w-full border-0 border-b border-[#abadaf] bg-transparent px-0 py-3 text-[#2c2f31] placeholder:text-[#747779]/65 transition-all duration-300 focus:border-[#0052d0] focus:outline-none focus:ring-0';

function addressExists(
  address: string,
  existingAddresses: AddressRecord[],
  currentAddressId?: string,
) {
  const normalizedAddress = normalizeAddressForComparison(address);

  return existingAddresses.some(
    (currentAddress) =>
      currentAddress.id !== currentAddressId &&
      normalizeAddressForComparison(currentAddress.address) === normalizedAddress,
  );
}

export function EditAddressModal({
  address,
  existingAddresses,
  isSubmitting = false,
  onClose,
  onSubmit,
  submitError,
}: EditAddressModalProps) {
  const [formValues, setFormValues] = useState<AddressFormValues>(emptyFormValues);
  const [coinData, setCoinData] = useState<CoinData | null>(null);
  const [error, setError] = useState('');
  const [isCoinLoading, setIsCoinLoading] = useState(false);

  const hasAddressInput = normalizeAddress(formValues.address).length > 0;
  const detectedType = useMemo(() => detectCryptoType(formValues.address), [formValues.address]);

  useEffect(() => {
    if (address) {
      setFormValues({
        label: address.label || '',
        address: address.address,
        direction: address.direction,
        type: address.type,
      });
      setCoinData(null);
      setError('');
      setIsCoinLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (!hasAddressInput || !detectedType) {
      setCoinData(null);
      setIsCoinLoading(false);
      return;
    }

    let isCancelled = false;

    setIsCoinLoading(true);

    void getCoinData(detectedType)
      .then((nextCoinData) => {
        if (!isCancelled) {
          setCoinData(nextCoinData);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setCoinData(null);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsCoinLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [detectedType, hasAddressInput]);

  const handleChange =
    (field: keyof AddressFormValues) => (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      const nextDetectedType = field === 'address' ? detectCryptoType(nextValue) : null;

      setFormValues((previous) => ({
        ...previous,
        [field]: nextValue,
        ...(field === 'address'
          ? {
              type: nextDetectedType ?? previous.type,
            }
          : {}),
      }));
      setError('');
    };

  const handleDirectionChange = useCallback((nextDirection: AddressFormValues['direction']) => {
    setFormValues((previous) => ({
      ...previous,
      direction: nextDirection,
    }));
    setError('');
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const nextValues: AddressFormValues = {
        ...formValues,
        address: normalizeAddress(formValues.address),
        label: formValues.label.trim(),
      };

      if (!nextValues.address) {
        setError('Address is required.');
        return;
      }

      const resolvedType = detectCryptoType(nextValues.address);

      if (!resolvedType || !isValidCryptoAddress(nextValues.address, resolvedType)) {
        setError('Invalid address');
        return;
      }

      if (addressExists(nextValues.address, existingAddresses, address?.id)) {
        setError('Address already exists');
        return;
      }

      setError('');
      await onSubmit({
        ...nextValues,
        type: resolvedType,
      });
    },
    [address?.id, existingAddresses, formValues, onSubmit],
  );

  return (
    <Modal
      description="Update an address while keeping its network and direction in sync"
      isOpen={Boolean(address)}
      onClose={onClose}
      title="Edit Address"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-6 px-5 pb-6 sm:px-8 sm:pb-8">
          <label className="block space-y-2">
            <span className={fieldLabelClassName}>Label</span>
            <div className="group relative">
              <input
                className={underlineInputClassName}
                placeholder="e.g. My Binance Wallet"
                type="text"
                value={formValues.label}
                onChange={handleChange('label')}
              />
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#0052d0] transition-all duration-300 group-focus-within:w-full" />
            </div>
          </label>

          <div className="space-y-2">
            <label className={fieldLabelClassName}>Address</label>
            <div className="group relative">
              <input
                className={[
                  underlineInputClassName,
                  error || submitError
                    ? 'border-[#b31b25] focus:border-[#b31b25]'
                    : '',
                ].join(' ')}
                placeholder="Paste wallet address"
                type="text"
                value={formValues.address}
                onChange={handleChange('address')}
              />
              <div
                className={[
                  'absolute bottom-0 left-0 h-0.5 transition-all duration-300 group-focus-within:w-full',
                  error || submitError ? 'w-full bg-[#b31b25]' : 'w-0 bg-[#0052d0]',
                ].join(' ')}
              />
            </div>

            {error || submitError ? (
              <div className="mt-1.5 flex items-center gap-1 text-[#b31b25]">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span className="text-xs font-medium">{error || submitError}</span>
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className={fieldLabelClassName}>Coin / Network</label>
            <DetectedCoinPreview
              coinData={coinData}
              detectedType={detectedType}
              hasAddressInput={hasAddressInput}
              isLoading={isCoinLoading}
            />
          </div>

          <div className="space-y-3">
            <label className={fieldLabelClassName}>Direction</label>
            <div className="grid grid-cols-2 gap-2 rounded-full bg-[#eef1f3] p-1">
              {(['RECEIVING', 'SENDING'] as const).map((directionOption) => {
                const isActive = formValues.direction === directionOption;

                return (
                  <button
                    className={[
                      'rounded-full px-4 py-2.5 text-sm font-semibold transition-all',
                      isActive
                        ? 'bg-white text-[#2c2f31] shadow-[0_10px_25px_rgba(15,23,42,0.08)]'
                        : 'text-[#5b636f] hover:text-[#2c2f31]',
                    ].join(' ')}
                    key={directionOption}
                    type="button"
                    onClick={() => {
                      handleDirectionChange(directionOption);
                    }}
                  >
                    {directionOption === 'RECEIVING' ? 'Receiving' : 'Sending'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 bg-[#eef1f3] px-5 py-5 sm:flex-row-reverse sm:px-8 sm:py-6">
          <button
            className="flex w-full items-center justify-center rounded-full bg-[#0052d0] px-8 py-3.5 text-sm font-bold text-[#f1f2ff] shadow-lg shadow-[#0052d0]/20 transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:bg-[#0052d0]/50 disabled:text-[#f1f2ff]/70 disabled:shadow-none sm:w-auto"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Updating...' : 'Update Address'}
          </button>
          <button
            className="w-full rounded-full bg-transparent px-8 py-3.5 text-sm font-bold text-[#0052d0] transition-all hover:bg-[#0052d0]/5 sm:w-auto"
            disabled={isSubmitting}
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
