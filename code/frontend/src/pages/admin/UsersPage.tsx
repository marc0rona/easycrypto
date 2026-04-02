import { useCallback, useState } from 'react';

import { UserTable } from '../../components/admin/UserTable';
import type { AdminUser } from '../../types/admin';

const initialUsers: AdminUser[] = [
  {
    id: 'user-1',
    username: 'driss_workspace',
    email: 'driss@ez-crypt0.app',
    status: 'active',
  },
  {
    id: 'user-2',
    username: 'alpha_trader',
    email: 'alpha@ez-crypt0.app',
    status: 'active',
  },
  {
    id: 'user-3',
    username: 'cold_storage_ops',
    email: 'ops@ez-crypt0.app',
    status: 'disabled',
  },
  {
    id: 'user-4',
    username: 'desk_team',
    email: 'desk@ez-crypt0.app',
    status: 'active',
  },
];

export function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);

  const handleActivate = useCallback((userId: string) => {
    setUsers((previous) =>
      previous.map((user) => (user.id === userId ? { ...user, status: 'active' } : user)),
    );
  }, []);

  const handleDisable = useCallback((userId: string) => {
    setUsers((previous) =>
      previous.map((user) => (user.id === userId ? { ...user, status: 'disabled' } : user)),
    );
  }, []);

  const handleDelete = useCallback((userId: string) => {
    const shouldDelete = window.confirm('Delete this user?');

    if (!shouldDelete) {
      return;
    }

    setUsers((previous) => previous.filter((user) => user.id !== userId));
  }, []);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/70">
          User management
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Users</h1>
        <p className="max-w-2xl text-sm leading-7 text-neutral-300 sm:text-base">
          Review account status and take quick actions on users in the mock admin environment.
        </p>
      </header>

      <UserTable
        onActivate={handleActivate}
        onDelete={handleDelete}
        onDisable={handleDisable}
        users={users}
      />
    </div>
  );
}
