import type { FormEvent } from 'react';

export interface UpdateNameFormProps {
  message?: string;
  onSubmit: () => void;
  onUsernameChange: (value: string) => void;
  username: string;
}

export function UpdateNameForm({
  message,
  onSubmit,
  onUsernameChange,
  username,
}: UpdateNameFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Update Name</h2>
        <p className="mt-2 text-sm leading-7 text-slate-300">
          Change how your account appears throughout the EZ-CRYPT0 workspace.
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-200">Username</span>
          <input
            autoComplete="username"
            className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/80"
            placeholder="Enter your username"
            type="text"
            value={username}
            onChange={(event) => onUsernameChange(event.target.value)}
          />
        </label>

        {message ? <p className="text-sm text-emerald-300">{message}</p> : null}

        <button
          className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-400/40"
          disabled={!username.trim()}
          type="submit"
        >
          Save Changes
        </button>
      </form>
    </section>
  );
}
