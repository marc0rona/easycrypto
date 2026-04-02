export interface ProfileCardProps {
  email: string;
  username: string;
}

export function ProfileCard({ email, username }: ProfileCardProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Profile Information</h2>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            Review the account details currently associated with your workspace.
          </p>
        </div>

        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
          Active
        </span>
      </div>

      <dl className="mt-6 space-y-4">
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <dt className="text-sm font-medium text-slate-400">Username</dt>
          <dd className="mt-2 text-lg font-semibold text-white">{username}</dd>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <dt className="text-sm font-medium text-slate-400">Email</dt>
          <dd className="mt-2 break-all text-lg font-semibold text-white">{email}</dd>
        </div>
      </dl>
    </section>
  );
}
