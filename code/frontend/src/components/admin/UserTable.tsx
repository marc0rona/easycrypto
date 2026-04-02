import type { AdminUser } from '../../types/admin';
import { UserRow } from './UserRow';

export interface UserTableProps {
  onActivate: (userId: string) => void;
  onDelete: (userId: string) => void;
  onDisable: (userId: string) => void;
  users: AdminUser[];
}

export function UserTable({ onActivate, onDelete, onDisable, users }: UserTableProps) {
  if (users.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-amber-400/20 bg-white/[0.02] px-6 py-14 text-center">
        <h2 className="text-2xl font-semibold text-white">No users remaining</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-neutral-300">
          All mock users have been removed from the local admin table.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-white/[0.02]">
            <tr className="text-left">
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400">
                Username
              </th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400">
                Email
              </th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400">
                Status
              </th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserRow
                key={user.id}
                onActivate={onActivate}
                onDelete={onDelete}
                onDisable={onDisable}
                user={user}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
