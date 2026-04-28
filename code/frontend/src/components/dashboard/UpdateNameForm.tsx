import type { FormEvent } from 'react';

export interface UpdateNameFormProps {
  email: string;
  errorMessage?: string;
  isSubmitting?: boolean;
  name: string;
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onSubmit: () => void;
  successMessage?: string;
  username: string;
}

export function UpdateNameForm({
  email,
  errorMessage,
  isSubmitting = false,
  name,
  onEmailChange,
  onNameChange,
  onSubmit,
  successMessage,
  username,
}: UpdateNameFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <section className="mb-8 rounded-xl bg-white px-5 py-8 shadow-[0_1px_3px_rgba(0,0,0,0.05)] sm:px-10 sm:py-10">
      <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
          <p className="mt-1 text-sm text-gray-500">Update your public profile details.</p>
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
              d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-10 grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.05em] text-gray-500">
              Full Name
            </span>
            <div className="group relative">
              <input
                autoComplete="name"
                className="w-full border-0 border-b border-[#D1D5DB] bg-transparent px-0 py-2.5 text-base font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#0066FF] focus:outline-none focus:ring-0"
                placeholder="Enter full name"
                type="text"
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
              />
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#0066FF] transition-all duration-300 group-focus-within:w-full" />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.05em] text-gray-500">
              Username
            </span>
            <div className="border-b border-[#D1D5DB] px-0 py-2.5 text-base font-medium text-gray-500">
              {username}
            </div>
            <p className="mt-2 text-xs text-gray-400">Username can’t be changed.</p>
          </label>

          <div className="md:col-span-2">
            <label className="block">
              <span className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.05em] text-gray-500">
                Email Address
              </span>
              <div className="group relative">
                <input
                  autoComplete="email"
                  className="w-full border-0 border-b border-[#D1D5DB] bg-transparent px-0 py-2.5 text-base font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#0066FF] focus:outline-none focus:ring-0"
                  placeholder="Enter email address"
                  type="email"
                  value={email}
                  onChange={(event) => onEmailChange(event.target.value)}
                />
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#0066FF] transition-all duration-300 group-focus-within:w-full" />
              </div>
            </label>
          </div>
        </div>

        {errorMessage ? <p className="mb-4 text-sm font-medium text-[#B31B25]">{errorMessage}</p> : null}
        {!errorMessage && successMessage ? (
          <p className="mb-4 text-sm font-medium text-[#0066FF]">{successMessage}</p>
        ) : null}

        <div className="flex justify-center sm:justify-end">
          <button
            className="w-full rounded-full border border-[#EEF4FF] bg-[#EEF4FF] px-8 py-2.5 text-sm font-bold text-[#0066FF] transition-colors duration-200 hover:bg-[#0066FF] hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            disabled={!name.trim() || !email.trim() || isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </section>
  );
}
