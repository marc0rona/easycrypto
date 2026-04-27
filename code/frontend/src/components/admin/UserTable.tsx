import { Card } from '../ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableShell,
} from '../ui/Table';
import type { AdminUser } from '../../types/admin';
import { UserRow } from './UserRow';

export interface UserTableProps {
  onActivate: (userId: string) => void;
  onDelete: (user: AdminUser) => void;
  onDisable: (userId: string) => void;
  users: AdminUser[];
}

export function UserTable({ onActivate, onDelete, onDisable, users }: UserTableProps) {
  if (users.length === 0) {
    return (
      <Card className="px-6 py-14 text-center" tone="muted">
        <h2 className="text-2xl font-semibold text-white">No users remaining</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-neutral-300">
          All mock users have been removed from the local admin table.
        </p>
      </Card>
    );
  }

  return (
    <TableShell>
      <div className="overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow className="border-t-0 hover:bg-transparent">
              <TableHeaderCell>Username</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <UserRow
                key={user.id}
                onActivate={onActivate}
                onDelete={onDelete}
                onDisable={onDisable}
                user={user}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </TableShell>
  );
}
