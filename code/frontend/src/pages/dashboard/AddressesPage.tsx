import { useCallback, useEffect, useState } from 'react';

import {
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from '../../api/address.api';
import { AddAddressModal } from '../../components/dashboard/AddAddressModal';
import { AddressTable } from '../../components/dashboard/AddressTable';
import { EditAddressModal } from '../../components/dashboard/EditAddressModal';
import { Loader } from '../../components/ui/Loader';
import type { AddressFormValues, AddressRecord } from '../../types/address';

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong while loading your addresses.';
}

export function AddressesPage() {
  const [addresses, setAddresses] = useState<AddressRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadAddresses = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await getAddresses();
      setAddresses(result);
    } catch (error) {
      console.error('Failed to load addresses.', error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAddresses();
  }, [loadAddresses]);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage('');
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [successMessage]);

  const handleOpenAddModal = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const handleCloseAddModal = useCallback(() => {
    setIsAddModalOpen(false);
  }, []);

  const handleOpenEditModal = useCallback((address: AddressRecord) => {
    setSelectedAddress(address);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setSelectedAddress(null);
  }, []);

  const handleAddAddress = useCallback(async (values: AddressFormValues) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const createdAddress = await createAddress(values);
      setAddresses((previous) => [createdAddress, ...previous]);
      setIsAddModalOpen(false);
      setSuccessMessage('Address added successfully.');
    } catch (error) {
      console.error('Failed to create address.', error);
      setErrorMessage(getErrorMessage(error));
    }
  }, []);

  const handleUpdateAddress = useCallback(
    async (values: AddressFormValues) => {
      if (!selectedAddress) {
        return;
      }

      setErrorMessage('');
      setSuccessMessage('');

      try {
        const updatedAddress = await updateAddress(selectedAddress.id, values);

        setAddresses((previous) =>
          previous.map((address) =>
            address.id === selectedAddress.id ? updatedAddress : address,
          ),
        );
        setSelectedAddress(null);
        setSuccessMessage('Address updated successfully.');
      } catch (error) {
        console.error('Failed to update address.', error);
        setErrorMessage(getErrorMessage(error));
      }
    },
    [selectedAddress],
  );

  const handleDeleteAddress = useCallback(async (addressId: string) => {
    const shouldDelete = window.confirm('Delete this address?');

    if (!shouldDelete) {
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    try {
      await deleteAddress(addressId);
      setAddresses((previous) => previous.filter((address) => address.id !== addressId));
      setSuccessMessage('Address deleted successfully.');
    } catch (error) {
      console.error('Failed to delete address.', error);
      setErrorMessage(getErrorMessage(error));
    }
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            My Addresses
          </h1>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            View, manage, and update every crypto address saved in your workspace.
          </p>
        </div>

        <button
          className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          type="button"
          onClick={handleOpenAddModal}
        >
          Add Address
        </button>
      </div>

      {successMessage ? (
        <section className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4">
          <p className="text-sm font-medium text-emerald-200">{successMessage}</p>
        </section>
      ) : null}

      {errorMessage ? (
        <section className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-5 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Something went wrong</p>
              <p className="mt-1 text-sm text-rose-100">{errorMessage}</p>
            </div>
            <button
              className="rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              type="button"
              onClick={() => {
                void loadAddresses();
              }}
            >
              Retry
            </button>
          </div>
        </section>
      ) : null}

      {isLoading ? (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-14 text-center">
          <Loader message="Loading..." />
        </section>
      ) : (
        <AddressTable
          addresses={addresses}
          onAddAddress={handleOpenAddModal}
          onDelete={handleDeleteAddress}
          onEdit={handleOpenEditModal}
        />
      )}

      <AddAddressModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleAddAddress}
      />
      <EditAddressModal
        address={selectedAddress}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateAddress}
      />
    </div>
  );
}
