import { useEffect, useState, type FormEvent } from 'react';

import type { AdminUser } from '../../types/admin';
import { Modal } from '../ui/Modal';

export interface AdminAccountFormValues {
  email: string;
  name: string;
  password?: string;
  username: string;
}

interface AdminAccountModalProps {
  errorMessage?: string;
  initialUser?: AdminUser | null;
  isOpen: boolean;
  isSubmitting?: boolean;
  mode: 'create' | 'edit';
  onClose: () => void;
  onSubmit: (values: AdminAccountFormValues) => void;
}

function getInitialValues(initialUser?: AdminUser | null) {
  return {
    email: initialUser?.email ?? '',
    name: initialUser?.name ?? '',
    password: '',
    username: initialUser?.username ?? '',
  };
}

export function AdminAccountModal({
  errorMessage,
  initialUser,
  isOpen,
  isSubmitting = false,
  mode,
  onClose,
  onSubmit,
}: AdminAccountModalProps) {
  const [values, setValues] = useState(() => getInitialValues(initialUser));

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setValues(getInitialValues(initialUser));
  }, [initialUser, isOpen]);

  const isCreateMode = mode === 'create';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(values);
  };

  const title = isCreateMode ? 'Create Admin Account' : 'Edit Account';
  const description = isCreateMode
    ? 'Create a new administrator account for the control workspace.'
    : 'Update the selected account details without touching the password.';

  const primaryLabel = isCreateMode ? 'Create Admin' : 'Save Changes';

  return (
    <Modal
      description={description}
      isOpen={isOpen}
      title={title}
      onClose={onClose}
    >
      <form className="px-5 pb-6 sm:px-8 sm:pb-8" onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <label className="block">
            <span className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[#747779]">
              Full Name
            </span>
            <div className="group relative">
              <input
                autoComplete="name"
                className="w-full border-0 border-b border-[#d1d5db] bg-transparent px-0 py-2.5 text-base font-medium text-[#2c2f31] placeholder:text-[#9aa0a6] focus:border-[#0066ff] focus:outline-none focus:ring-0"
                placeholder="Enter full name"
                type="text"
                value={values.name}
                onChange={(event) => {
                  setValues((current) => ({ ...current, name: event.target.value }));
                }}
              />
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#0066ff] transition-all duration-300 group-focus-within:w-full" />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[#747779]">
              Username
            </span>
            <div className="group relative">
              <input
                autoComplete="username"
                className="w-full border-0 border-b border-[#d1d5db] bg-transparent px-0 py-2.5 text-base font-medium text-[#2c2f31] placeholder:text-[#9aa0a6] focus:border-[#0066ff] focus:outline-none focus:ring-0"
                placeholder="Enter username"
                type="text"
                value={values.username}
                onChange={(event) => {
                  setValues((current) => ({ ...current, username: event.target.value }));
                }}
              />
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#0066ff] transition-all duration-300 group-focus-within:w-full" />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[#747779]">
              Email Address
            </span>
            <div className="group relative">
              <input
                autoComplete="email"
                className="w-full border-0 border-b border-[#d1d5db] bg-transparent px-0 py-2.5 text-base font-medium text-[#2c2f31] placeholder:text-[#9aa0a6] focus:border-[#0066ff] focus:outline-none focus:ring-0"
                placeholder="Enter email address"
                type="email"
                value={values.email}
                onChange={(event) => {
                  setValues((current) => ({ ...current, email: event.target.value }));
                }}
              />
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#0066ff] transition-all duration-300 group-focus-within:w-full" />
            </div>
          </label>

          {isCreateMode ? (
            <label className="block">
              <span className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[#747779]">
                Temporary Password
              </span>
              <div className="group relative">
                <input
                  autoComplete="new-password"
                  className="w-full border-0 border-b border-[#d1d5db] bg-transparent px-0 py-2.5 text-base font-medium text-[#2c2f31] placeholder:text-[#9aa0a6] focus:border-[#0066ff] focus:outline-none focus:ring-0"
                  placeholder="Set the initial password"
                  type="password"
                  value={values.password}
                  onChange={(event) => {
                    setValues((current) => ({ ...current, password: event.target.value }));
                  }}
                />
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#0066ff] transition-all duration-300 group-focus-within:w-full" />
              </div>
              <p className="mt-2 text-xs text-[#8a8f94]">The new admin can change this after signing in.</p>
            </label>
          ) : (
            <div className="rounded-2xl bg-[#f5f7f9] px-4 py-4">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[#747779]">Password</p>
              <p className="mt-2 text-sm text-[#595c5e]">Passwords can’t be changed from this admin editor.</p>
            </div>
          )}

          <div className="rounded-2xl bg-[#eef4ff] px-4 py-4">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[#0052d0]">Account Role</p>
            <p className="mt-2 text-sm font-semibold text-[#2c2f31]">
              {isCreateMode ? 'Administrator' : initialUser?.role === 'admin' ? 'Administrator' : 'User account'}
            </p>
          </div>
        </div>

        {errorMessage ? (
          <p className="mt-6 text-sm font-medium text-[#b31b25]">{errorMessage}</p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            className="w-full rounded-full border border-[#d9dde0] px-6 py-2.5 text-sm font-semibold text-[#595c5e] transition-colors hover:bg-[#eef1f3] sm:w-auto"
            disabled={isSubmitting}
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="w-full rounded-full bg-[#0052d0] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0044af] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            disabled={
              !values.name.trim() ||
              !values.username.trim() ||
              !values.email.trim() ||
              (isCreateMode && !values.password?.trim()) ||
              isSubmitting
            }
            type="submit"
          >
            {isSubmitting ? (isCreateMode ? 'Creating...' : 'Saving...') : primaryLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
