import type { AdminUser } from '../../types/admin';

export interface UserRowProps {
  onActivate: (userId: string) => void;
  onDelete: (userId: string) => void;
  onDisable: (userId: string) => void;
  user: AdminUser;
}

export function UserRow({ onActivate, onDelete, onDisable, user }: UserRowProps) {
  const isActive = user.status === 'active';

  return (
    <tr className="border-t border-white/10">
      <td className="px-4 py-4 text-sm font-medium text-white">{user.username}</td>
      <td className="px-4 py-4 text-sm text-neutral-300">{user.email}</td>
      <td className="px-4 py-4">
        <span
          className={[
            'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]',
            isActive
              ? 'bg-emerald-400/10 text-emerald-300'
              : 'bg-rose-400/10 text-rose-200',
          ].join(' ')}
        >
          {user.status}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-2">
          {isActive ? (
            <button
              className="rounded-full border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-400/20"
              type="button"
              onClick={() => onDisable(user.id)}
            >
              Disable
            </button>
          ) : (
            <button
              className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-400/20"
              type="button"
              onClick={() => onActivate(user.id)}
            >
              Activate
            </button>
          )}

          <button
            className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.08]"
            type="button"
            onClick={() => onDelete(user.id)}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
