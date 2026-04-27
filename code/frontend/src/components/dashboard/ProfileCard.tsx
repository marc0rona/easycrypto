import { Card } from '../ui/Card';

export interface ProfileCardProps {
  email: string;
  username: string;
}

export function ProfileCard({ email, username }: ProfileCardProps) {
  return (
    <Card className="p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Profile Information</h2>
          <p className="mt-2 text-sm leading-7 text-slate-400">
            Review the account details currently associated with your workspace.
          </p>
        </div>

        <span className="rounded-xl border border-cyan-400/15 bg-cyan-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
          Active
        </span>
      </div>

      <dl className="mt-8 space-y-4">
        <div className="rounded-2xl border border-white/8 bg-[#0b1020]/80 p-5">
          <dt className="text-sm font-medium text-slate-400">Username</dt>
          <dd className="mt-2 text-lg font-semibold text-white">{username}</dd>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#0b1020]/80 p-5">
          <dt className="text-sm font-medium text-slate-400">Email</dt>
          <dd className="mt-2 break-all text-lg font-semibold text-white">{email}</dd>
        </div>
      </dl>
    </Card>
  );
}
