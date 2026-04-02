import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react';

import { ADDRESS_TYPES, type AddressFormValues, type AddressRecord } from '../../types/address';

export interface EditAddressModalProps {
  address: AddressRecord | null;
  onClose: () => void;
  onSubmit: (values: AddressFormValues) => void;
}

const emptyFormValues: AddressFormValues = {
  label: '',
  address: '',
  type: 'ETH',
};

export function EditAddressModal({ address, onClose, onSubmit }: EditAddressModalProps) {
  const [formValues, setFormValues] = useState<AddressFormValues>(emptyFormValues);
  const [error, setError] = useState('');

  useEffect(() => {
    if (address) {
      setFormValues({
        label: address.label || '',
        address: address.address,
        type: address.type,
      });
      setError('');
    }
  }, [address]);

  const handleChange =
    (field: keyof AddressFormValues) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormValues((previous) => ({
        ...previous,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!formValues.address.trim()) {
        setError('Address is required.');
        return;
      }

      onSubmit({
        ...formValues,
        address: formValues.address.trim(),
        label: formValues.label.trim(),
      });
    },
    [formValues, onSubmit],
  );

  if (!address) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl shadow-black/30">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Edit Address</h2>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Update the selected address details.
            </p>
          </div>

          <button
            className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-200">Label</span>
            <input
              className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/80"
              placeholder="Optional name"
              type="text"
              value={formValues.label}
              onChange={handleChange('label')}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-200">Address</span>
            <input
              className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/80"
              placeholder="Paste wallet address"
              type="text"
              value={formValues.address}
              onChange={handleChange('address')}
            />
            {error ? <span className="text-sm text-rose-300">{error}</span> : null}
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-200">Type</span>
            <select
              className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/80"
              value={formValues.type}
              onChange={handleChange('type')}
            >
              {ADDRESS_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              className="rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              type="submit"
            >
              Update Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
