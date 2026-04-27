import type { FormEvent } from 'react';

export interface ChangePasswordFormProps {
  currentPassword: string;
  errorMessage?: string;
  isSubmitting?: boolean;
  newPassword: string;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onSubmit: () => void;
  successMessage?: string;
}

export function ChangePasswordForm({
  currentPassword,
  errorMessage,
  isSubmitting = false,
  newPassword,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onSubmit,
  successMessage,
}: ChangePasswordFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <section className="rounded-xl bg-white px-5 py-8 shadow-[0_1px_3px_rgba(0,0,0,0.05)] sm:px-10 sm:py-10">
      <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Security &amp; Password</h2>
          <p className="mt-1 text-sm text-gray-500">
            Keep your account secure with a strong password.
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EEF4FF] text-[#0066FF]">
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-12 grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.05em] text-gray-500">
              Current Password
            </span>
            <div className="group relative">
              <input
                autoComplete="current-password"
                className="w-full border-0 border-b border-[#D1D5DB] bg-transparent px-0 py-2.5 text-base font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#0066FF] focus:outline-none focus:ring-0"
                placeholder="Enter current password"
                type="password"
                value={currentPassword}
                onChange={(event) => onCurrentPasswordChange(event.target.value)}
              />
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#0066FF] transition-all duration-300 group-focus-within:w-full" />
            </div>
          </label>

          <label>
            <span className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.05em] text-gray-500">
              New Password
            </span>
            <div className="group relative">
              <input
                autoComplete="new-password"
                className="w-full border-0 border-b border-[#D1D5DB] bg-transparent px-0 py-2.5 text-base font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#0066FF] focus:outline-none focus:ring-0"
                placeholder="Enter new password"
                type="password"
                value={newPassword}
                onChange={(event) => onNewPasswordChange(event.target.value)}
              />
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#0066FF] transition-all duration-300 group-focus-within:w-full" />
            </div>
          </label>

          <div>
            <span className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.05em] text-gray-500">
              Password Rule
            </span>
            <div className="text-sm text-gray-400">Use at least 6 characters</div>
          </div>
        </div>

        {errorMessage ? <p className="mb-4 text-sm font-medium text-[#B31B25]">{errorMessage}</p> : null}
        {!errorMessage && successMessage ? (
          <p className="mb-4 text-sm font-medium text-[#0066FF]">{successMessage}</p>
        ) : null}

        <div className="flex justify-center">
          <button
            className="w-full rounded-full border border-[#EEF4FF] bg-[#EEF4FF] px-10 py-3 text-sm font-bold text-[#0066FF] transition-colors duration-200 hover:bg-[#0066FF] hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            disabled={!currentPassword.trim() || !newPassword.trim() || isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </section>
  );
}
