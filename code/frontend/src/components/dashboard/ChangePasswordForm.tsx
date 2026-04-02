import type { FormEvent } from 'react';

export interface ChangePasswordFormProps {
  currentPassword: string;
  errorMessage?: string;
  newPassword: string;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onSubmit: () => void;
  successMessage?: string;
}

export function ChangePasswordForm({
  currentPassword,
  errorMessage,
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
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Change Password</h2>
        <p className="mt-2 text-sm leading-7 text-slate-300">
          Update your password to keep your account access secure.
        </p>
      </div>

      <form className="mt-6 grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-200">Current password</span>
          <input
            autoComplete="current-password"
            className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/80"
            placeholder="Enter current password"
            type="password"
            value={currentPassword}
            onChange={(event) => onCurrentPasswordChange(event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-200">New password</span>
          <input
            autoComplete="new-password"
            className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/80"
            placeholder="Create a new password"
            type="password"
            value={newPassword}
            onChange={(event) => onNewPasswordChange(event.target.value)}
          />
        </label>

        <div className="lg:col-span-2">
          {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}
          {!errorMessage && successMessage ? (
            <p className="text-sm text-emerald-300">{successMessage}</p>
          ) : null}
        </div>

        <div className="lg:col-span-2">
          <button
            className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            type="submit"
          >
            Update Password
          </button>
        </div>
      </form>
    </section>
  );
}
