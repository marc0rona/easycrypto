import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import { getUsers, updateUserAccount, updateUserStatus } from '../../api/admin.api';
import { useAuth } from '../../hooks/useAuth';
import { useFeedback } from '../../hooks/useFeedback';
import type { AdminLayoutContextValue } from '../../layouts/AdminLayout';
import type { AdminUser, AdminUserStatus } from '../../types/admin';
import { AdminAccountModal } from './AdminAccountModal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ErrorState } from '../ui/ErrorState';
import { Loader } from '../ui/Loader';

const adminAvatarUrls = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCWm0M0JU8ucU3uGJzIxs3gmMm2j-pGGmXQk0XQ9mfXxBq_BpFWU00mSdfLxheWViQtAhFNNdFel0uVb7vVvcM27YnJp4Zx-dyegJqE2PeUrIs1ay-VqZfbTHvEinJHXpmYTzzXsYEy1hnkk-0q97_kjONpqUzzYV_5ItnXv5qfi0kelxC74e0A-9wFyyVzNjKmen56CDwLimescn3huGvJRRWgP9BOHA1LG2pj8CA72Jmzzs_zGJLzK0a5XGfFONZcTFBKgmEtGJXf',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAp1HVwy7XLCrvXzbtAGVXVrFhpicw5K0zlglbPvkv3BXUJRZFPKm0l8CTFsGIwxi5MdZGxz4VxSOmNhkJuPJ7JkmnpvilOfA20nHfKZV7vcpbabR1w8Do4QIe0IZWVrEiHBnyGgSefUyk5eLg9FsLQmbEfWsYmojUfgGGRoO5LaU4J0KezsGu_8Iy1TLmILlJkGprIcxeDFDDDFhFeYirjeIXvgkA6qweq8wWp6y9LV0RnXmO8HVUgxIs4Z1dlLd5CPMBQODjL4AHe',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBvDnhvMJ1SnY9GK-xJ5F6rRSb0av85EJ-sCon8nAjQsFQXgXIRHOYjbd0vidIvuuKpXShlHW5axqFx-Iz_q6q-5bmp2OQSJhe3qri0mOAUnGdFJsiTQX6yoHlJD6WYkElXmp-K17x_-D0kGE4recTnQ8Q-_Zby4gXiuk6FaiYubN7ZS4_wWkDZiiJGKbQFSPK7i0WTGL97APusgXjWd9YxJ3HGEAXk6bdn3899nLbffR_7p9lzf2ElZ5RIAoXnlihmA96B7KKPPPnR',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAH6gBInRbIxYZzuD83AOOIX7Fm5gu8QbdwU55Wp2YH56M0ysaGFQeOZRT-tDLk4kpr9fECcQJCIo1Kuo6f9u8sYni5VW9lKJFgUQXkPGYA6Z0bt16fYRaPCmp2eKs5ail2kmIWB8ggWPUq1xvO6G4r3ECwQgFtDy2Le-Ag71VclgfLuOZsoPRO3p0mPQGSSov8Xq8WOamFeCSDAbw-L8EoB8OsLwl6lRVEKNdfoQDba8nOah-URlrVVORo3ucDp_f9EpPeGj2PE3FK',
] as const;
const USERS_PER_PAGE = 10;

type UserFilter = 'ALL' | 'ACTIVE' | 'DISABLED';
type RoleFilter = 'ALL' | 'ADMINS' | 'USERS';

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong while loading users.';
}

function getDisplayName(username: string) {
  return username
    .split(/[_\-.]/g)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}

function getStatusClasses(status: AdminUserStatus) {
  return status === 'active'
    ? 'bg-green-100 text-green-700'
    : 'bg-slate-100 text-slate-600';
}

function formatRole(role: AdminUser['role']) {
  return role === 'admin' ? 'Administrator' : 'Platform user';
}

function formatJoinDate(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getPresentation(user: AdminUser, index: number) {
  return {
    avatar: adminAvatarUrls[index % adminAvatarUrls.length],
    dateLabel: formatJoinDate(user.createdAt),
    subtitle: `@${user.username} · ${formatRole(user.role)}`,
    title: user.name.trim() || getDisplayName(user.username),
  };
}

export function AdminUsersWorkspace() {
  const { adminUsersVersion, searchQuery, setSearchQuery } = useOutletContext<AdminLayoutContextValue>();
  const { user: currentUser } = useAuth();
  const { showSuccess } = useFeedback();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState<UserFilter>('ALL');
  const [activeRoleFilter, setActiveRoleFilter] = useState<RoleFilter>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editError, setEditError] = useState('');
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [isStatusSubmitting, setIsStatusSubmitting] = useState(false);
  const [pendingDisableUser, setPendingDisableUser] = useState<AdminUser | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await getUsers();
      setUsers(result);
    } catch (error) {
      console.error('Failed to load admin users.', error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [adminUsersVersion, loadUsers]);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const userCounts = useMemo(
    () => ({
      active: users.filter((user) => user.status === 'active').length,
      all: users.length,
      disabled: users.filter((user) => user.status === 'disabled').length,
    }),
    [users],
  );

  const roleCounts = useMemo(
    () => ({
      admins: users.filter((user) => user.role === 'admin').length,
      all: users.length,
      users: users.filter((user) => user.role === 'user').length,
    }),
    [users],
  );

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const matchesStatusFilter =
          activeFilter === 'ALL'
            ? true
            : activeFilter === 'ACTIVE'
              ? user.status === 'active'
              : user.status === 'disabled';

        const matchesRoleFilter =
          activeRoleFilter === 'ALL'
            ? true
            : activeRoleFilter === 'ADMINS'
              ? user.role === 'admin'
              : user.role === 'user';

        const matchesSearch =
          !normalizedSearch ||
          [user.username, user.email]
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch);

        return matchesStatusFilter && matchesRoleFilter && matchesSearch;
      }),
    [activeFilter, activeRoleFilter, normalizedSearch, users],
  );

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
  }, [currentPage, filteredUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, activeRoleFilter, normalizedSearch]);

  useEffect(() => {
    setCurrentPage((previousPage) => Math.min(previousPage, totalPages));
  }, [totalPages]);

  const paginationSummary = useMemo(() => {
    if (filteredUsers.length === 0) {
      return 'Showing 0 users';
    }

    const startIndex = (currentPage - 1) * USERS_PER_PAGE + 1;
    const endIndex = Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length);

    return `Showing ${startIndex}-${endIndex} of ${filteredUsers.length} users`;
  }, [currentPage, filteredUsers.length]);

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages],
  );

  const handleActivate = useCallback(async (userId: string) => {
    setErrorMessage('');

    try {
      const updatedUser = await updateUserStatus(userId, 'active');
      setUsers((previous) => previous.map((user) => (user.id === userId ? updatedUser : user)));
      showSuccess(`${updatedUser.name.trim() || updatedUser.username} was activated.`);
    } catch (error) {
      console.error('Failed to activate user.', error);
      setErrorMessage(getErrorMessage(error));
    }
  }, [showSuccess]);

  const handleDisable = useCallback(async (userId: string) => {
    setErrorMessage('');
    setIsStatusSubmitting(true);

    try {
      const updatedUser = await updateUserStatus(userId, 'disabled');
      setUsers((previous) => previous.map((user) => (user.id === userId ? updatedUser : user)));
      showSuccess(`${updatedUser.name.trim() || updatedUser.username} was disabled.`);
    } catch (error) {
      console.error('Failed to disable user.', error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsStatusSubmitting(false);
    }
  }, [showSuccess]);

  const handleRequestDisable = useCallback((user: AdminUser) => {
    setPendingDisableUser(user);
  }, []);

  const handleCloseDisableDialog = useCallback(() => {
    if (isStatusSubmitting) {
      return;
    }

    setPendingDisableUser(null);
  }, [isStatusSubmitting]);

  const handleConfirmDisable = useCallback(async () => {
    if (!pendingDisableUser) {
      return;
    }

    await handleDisable(pendingDisableUser.id);
    setPendingDisableUser(null);
  }, [handleDisable, pendingDisableUser]);

  const handleRequestEdit = useCallback((user: AdminUser) => {
    setEditError('');
    setEditingUser(user);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    if (isEditSubmitting) {
      return;
    }

    setEditError('');
    setEditingUser(null);
  }, [isEditSubmitting]);

  const handleEditUser = useCallback(
    async (values: { email: string; name: string; username: string }) => {
      if (!editingUser) {
        return;
      }

      setEditError('');
      setIsEditSubmitting(true);

      try {
        const updatedUser = await updateUserAccount(editingUser.id, values);
        setUsers((previous) =>
          previous.map((user) => (user.id === editingUser.id ? updatedUser : user)),
        );
        setEditingUser(null);
        showSuccess(`${updatedUser.name.trim() || updatedUser.username} was updated.`);
      } catch (error) {
        console.error('Failed to update user account.', error);
        setEditError(getErrorMessage(error));
      } finally {
        setIsEditSubmitting(false);
      }
    },
    [editingUser, showSuccess],
  );

  return (
    <>
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-[#2c2f31] [font-family:Manrope,sans-serif] sm:text-4xl">
              User Management
            </h1>
            <p className="max-w-lg leading-relaxed text-[#595c5e]">
              Oversee system access, manage user privileges, and monitor account statuses across the global network.
            </p>
          </div>

          <div className="flex w-full gap-4 xl:w-auto">
            <div className="flex w-full flex-wrap gap-1 rounded-full bg-white p-1 shadow-sm xl:w-auto">
              {([
                ['ACTIVE', 'Active', userCounts.active],
                ['DISABLED', 'Disabled', userCounts.disabled],
              ] as const).map(([value, label, count]) => (
                <button
                  key={value}
                  className={[
                    'px-4 py-2 text-xs font-semibold rounded-full transition-colors',
                    activeFilter === value
                      ? 'bg-[#0052d0] text-[#f1f2ff]'
                      : 'text-[#595c5e] hover:text-[#0052d0]',
                    ].join(' ')}
                    type="button"
                    onClick={() => {
                      setActiveFilter((current) => (current === value ? 'ALL' : value));
                    }}
                  >
                    {label} <span className="ml-1 opacity-70">{count}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-[24px] bg-white px-4 py-5 shadow-sm sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold text-[#2c2f31]">Search users</p>
              <p className="mt-1 text-sm text-[#595c5e]">
                Search by username or email, then narrow the list by role.
              </p>
            </div>

            <div className="flex w-full max-w-4xl flex-col gap-4 lg:items-end">
              <label className="flex w-full items-center gap-3 rounded-full bg-[#eef1f3] px-5 py-3">
                <span className="material-symbols-outlined text-[#747779]">search</span>
                <input
                  className="w-full border-none bg-transparent text-sm text-[#2c2f31] placeholder:text-[#747779] focus:outline-none focus:ring-0"
                  placeholder="Search by username or email..."
                  type="text"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                  }}
                />
                {searchQuery ? (
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#747779] transition-colors hover:bg-slate-200/80 hover:text-[#2c2f31]"
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                    }}
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                ) : null}
              </label>

              <div className="flex flex-wrap gap-2">
                {([
                  ['ADMINS', 'Admins', roleCounts.admins],
                  ['USERS', 'Users', roleCounts.users],
                ] as const).map(([value, label, count]) => (
                  <button
                    key={value}
                    className={[
                      'rounded-full px-4 py-2 text-xs font-semibold transition-colors',
                      activeRoleFilter === value
                        ? 'bg-[#0052d0] text-[#f1f2ff]'
                        : 'bg-[#eef1f3] text-[#595c5e] hover:text-[#0052d0]',
                    ].join(' ')}
                    type="button"
                    onClick={() => {
                      setActiveRoleFilter((current) => (current === value ? 'ALL' : value));
                    }}
                  >
                    {label} <span className="ml-1 opacity-70">{count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {errorMessage ? (
          <ErrorState
            className="mb-8 rounded-xl border-0 bg-white px-6 py-5 shadow-sm"
            message={errorMessage}
            onRetry={() => {
              void loadUsers();
            }}
          />
        ) : null}

        {isLoading ? (
          <div className="rounded-xl bg-white shadow-sm">
            <Loader message="Loading users..." />
          </div>
        ) : null}

        {!isLoading ? (
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">

            {filteredUsers.length === 0 ? (
              <div className="px-8 py-16 text-center">
                <h2 className="text-2xl font-bold text-[#2c2f31] [font-family:Manrope,sans-serif]">
                  No users match this view
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#595c5e]">
                  Try a different username or email search, or change the active filters.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[860px] divide-y-0">
                <div className="grid grid-cols-12 bg-[#eef1f3] px-8 py-5 text-xs font-bold uppercase tracking-widest text-[#595c5e]">
                  <div className="col-span-4">User Name</div>
                  <div className="col-span-3">Email</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Join Date</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>
                {paginatedUsers.map((user, index) => {
                  const presentation = getPresentation(user, index);
                  const isActive = user.status === 'active';
                  const isCurrentAdmin = currentUser?.id === user.id;

                  return (
                    <div
                      key={user.id}
                      className="grid grid-cols-12 items-center px-8 py-6 transition-colors hover:bg-[#d9dde0]/30 group"
                    >
                      <div className="col-span-4 flex items-center gap-4">
                        <img
                          alt={`${presentation.title} avatar`}
                          className="w-12 h-12 rounded-xl object-cover"
                          loading="lazy"
                          src={presentation.avatar}
                        />
                        <div>
                          <p className="text-sm font-bold text-[#2c2f31]">{presentation.title}</p>
                          <p className="text-xs text-[#595c5e]">{presentation.subtitle}</p>
                          {isCurrentAdmin ? (
                            <p className="mt-1 text-[11px] font-medium text-[#0052d0]">
                              Current admin session
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="col-span-3 text-sm text-[#595c5e]">{user.email}</div>

                      <div className="col-span-2">
                        <span
                          className={[
                            'inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                            getStatusClasses(user.status),
                          ].join(' ')}
                        >
                          {isActive ? 'Active' : 'Disabled'}
                        </span>
                      </div>

                      <div className="col-span-2 text-sm text-[#595c5e]">{presentation.dateLabel}</div>

                      <div className="col-span-1 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="rounded-lg p-2 text-[#595c5e] transition-colors hover:bg-[#799dff]/10 hover:text-[#0052d0]"
                            title="Edit account"
                            type="button"
                            onClick={() => {
                              handleRequestEdit(user);
                            }}
                          >
                            <span className="material-symbols-outlined text-xl">edit</span>
                          </button>
                          <button
                            className={[
                              'rounded-lg p-2 transition-colors',
                              isCurrentAdmin
                                ? 'cursor-not-allowed text-[#c3c8cd]'
                                : isActive
                                  ? 'text-[#595c5e] hover:bg-[#fff0ef] hover:text-[#b31b25]'
                                  : 'text-[#595c5e] hover:bg-[#edf9f0] hover:text-[#15803d]',
                            ].join(' ')}
                            disabled={isCurrentAdmin}
                            title={
                              isCurrentAdmin
                                ? "You can't change your own status"
                                : isActive
                                  ? 'Disable account'
                                  : 'Activate account'
                            }
                            type="button"
                            onClick={() => {
                              if (isCurrentAdmin) {
                                return;
                              }

                              if (isActive) {
                                handleRequestDisable(user);
                              } else {
                                void handleActivate(user.id);
                              }
                            }}
                          >
                            <span className="material-symbols-outlined text-xl">
                              {isActive ? 'block' : 'check_circle'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {!isLoading && filteredUsers.length > USERS_PER_PAGE ? (
          <div className="mt-5 flex flex-col items-center gap-4 rounded-xl bg-white px-5 py-4 text-center shadow-sm">
            <p className="text-sm font-medium text-[#595c5e]">{paginationSummary}</p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                className="rounded-lg border border-[#d9dfe5] px-4 py-2 text-sm font-semibold text-[#2c2f31] transition-colors hover:bg-[#f5f7f9] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={currentPage === 1}
                type="button"
                onClick={() => {
                  setCurrentPage((previousPage) => Math.max(1, previousPage - 1));
                }}
              >
                Previous
              </button>

              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  className={[
                    'rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors',
                    currentPage === pageNumber
                      ? 'bg-[#0052d0] text-white'
                      : 'border border-[#d9dfe5] text-[#2c2f31] hover:bg-[#f5f7f9]',
                  ].join(' ')}
                  type="button"
                  onClick={() => {
                    setCurrentPage(pageNumber);
                  }}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                className="rounded-lg border border-[#d9dfe5] px-4 py-2 text-sm font-semibold text-[#2c2f31] transition-colors hover:bg-[#f5f7f9] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={currentPage === totalPages}
                type="button"
                onClick={() => {
                  setCurrentPage((previousPage) => Math.min(totalPages, previousPage + 1));
                }}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}

      </div>

      <AdminAccountModal
        errorMessage={editError}
        initialUser={editingUser}
        isOpen={Boolean(editingUser)}
        isSubmitting={isEditSubmitting}
        mode="edit"
        onClose={handleCloseEditModal}
        onSubmit={(values) => {
          void handleEditUser({
            email: values.email,
            name: values.name,
            username: values.username,
          });
        }}
      />

      <ConfirmDialog
        confirmLabel="Disable account"
        description={
          pendingDisableUser
            ? `Disable ${pendingDisableUser.name.trim() || pendingDisableUser.username}? They will no longer be able to sign in until the account is re-enabled.`
            : 'Disable this account?'
        }
        isOpen={Boolean(pendingDisableUser)}
        isSubmitting={isStatusSubmitting}
        title="Disable account"
        onClose={handleCloseDisableDialog}
        onConfirm={() => {
          void handleConfirmDisable();
        }}
      />
    </>
  );
}
