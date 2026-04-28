import type { AdminUser } from '../../types/admin';
import { Button } from '../ui/Button';
import { TableCell, TableRow } from '../ui/Table';

export interface UserRowProps {
  onActivate: (userId: string) => void;
  onDelete: (user: AdminUser) => void;
  onDisable: (userId: string) => void;
  user: AdminUser;
}

export function UserRow({ onActivate, onDelete, onDisable, user }: UserRowProps) {
  const isActive = user.status === 'active';

  return (
    <TableRow>
      <TableCell className="text-sm font-medium text-white">{user.username}</TableCell>
      <TableCell className="text-sm text-neutral-300">{user.email}</TableCell>
      <TableCell>
        <span
          className={[
            'rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]',
            isActive
              ? 'border border-emerald-400/15 bg-emerald-400/10 text-emerald-200'
              : 'border border-rose-400/15 bg-rose-400/10 text-rose-200',
          ].join(' ')}
        >
          {user.status}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-2">
          {isActive ? (
            <Button size="sm" variant="danger" onClick={() => onDisable(user.id)}>
              Disable
            </Button>
          ) : (
            <Button size="sm" variant="primary" onClick={() => onActivate(user.id)}>
              Activate
            </Button>
          )}

          <Button size="sm" variant="secondary" onClick={() => onDelete(user)}>
            Delete
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
