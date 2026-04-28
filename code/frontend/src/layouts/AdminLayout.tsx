import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { createAdmin, type CreateAdminPayload } from '../api/admin.api';
import { AdminAccountModal } from '../components/admin/AdminAccountModal';
import { useAuth } from '../hooks/useAuth';
import { useFeedback } from '../hooks/useFeedback';

interface AdminLink {
  icon: string;
  label: string;
  match: readonly string[];
  to: string;
}

const adminLinks: AdminLink[] = [
  { icon: 'group', label: 'User Management', to: '/admin', match: ['/admin', '/admin/users'] },
  { icon: 'account_circle', label: 'My Profile', to: '/admin/profile', match: ['/admin/profile'] },
];

export interface AdminLayoutContextValue {
  adminUsersVersion: number;
  openCreateAdminModal: () => void;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
}

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { showSuccess } = useFeedback();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState(false);
  const [isCreateAdminSubmitting, setIsCreateAdminSubmitting] = useState(false);
  const [createAdminError, setCreateAdminError] = useState('');
  const [adminUsersVersion, setAdminUsersVersion] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);

    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Failed to log out from the admin dashboard.', error);
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout, navigate]);

  const openCreateAdminModal = useCallback(() => {
    setCreateAdminError('');
    setIsCreateAdminModalOpen(true);
  }, []);

  const closeCreateAdminModal = useCallback(() => {
    if (isCreateAdminSubmitting) {
      return;
    }

    setCreateAdminError('');
    setIsCreateAdminModalOpen(false);
  }, [isCreateAdminSubmitting]);

  const handleCreateAdmin = useCallback(
    async (values: CreateAdminPayload) => {
      setCreateAdminError('');
      setIsCreateAdminSubmitting(true);

      try {
        await createAdmin(values);
        setAdminUsersVersion((current) => current + 1);
        setIsCreateAdminModalOpen(false);
        showSuccess('New admin account created successfully.');
        navigate('/admin/users');
      } catch (error) {
        if (error instanceof Error && error.message) {
          setCreateAdminError(error.message);
        } else {
          setCreateAdminError('Unable to create the admin account right now.');
        }
      } finally {
        setIsCreateAdminSubmitting(false);
      }
    },
    [navigate, showSuccess],
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f7f9] text-[#2c2f31] antialiased lg:flex-row">
      <aside className="z-50 flex h-auto w-full flex-col border-b border-slate-200/60 bg-slate-50 px-4 py-6 sm:px-6 sm:py-8 lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r lg:border-slate-200/50">
          <div className="mb-12">
            <span className="text-lg font-extrabold tracking-tight text-blue-600">EZ-CRYPT0</span>
          </div>

          <div className="mb-10">
            <div className="mb-2 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#799dff]">
                <span
                  className="material-symbols-outlined text-[#001e58]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  admin_panel_settings
                </span>
              </div>
              <div>
                <p className="text-sm font-black text-blue-700">Admin Panel</p>
                <p className="text-xs text-slate-500">System Controller</p>
              </div>
            </div>
          </div>

          <nav className="flex flex-1 flex-wrap gap-2 lg:block lg:space-y-2" aria-label="Admin navigation">
            {adminLinks.map((link) => {
              const isActive = link.match.includes(location.pathname);

              return (
                <NavLink
                  key={link.to}
                  className={[
                    'flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all duration-300 ease-out',
                    isActive
                      ? 'bg-blue-50/50 font-semibold text-blue-700'
                      : 'text-slate-600 hover:bg-slate-200/50',
                  ].join(' ')}
                  to={link.to}
                >
                  <span className="material-symbols-outlined">{link.icon}</span>
                  <span>{link.label}</span>
                </NavLink>
              );
            })}

          </nav>

          <div className="mt-auto space-y-2">
            <button
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-600 transition-all duration-300 ease-out hover:bg-slate-200/50"
              type="button"
              onClick={() => {
                void handleLogout();
              }}
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="text-sm">Log Out</span>
            </button>
          </div>
      </aside>

      <main className="min-h-screen flex-1 lg:ml-72">
        <header className="sticky top-0 z-40 flex w-full items-center justify-center bg-white/70 px-4 py-4 backdrop-blur-xl transition-all duration-300 sm:px-6 lg:justify-end lg:px-8">
          <div className="flex items-center gap-4">
            <button
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#0052d0_0%,#799dff_100%)] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto sm:px-6"
              type="button"
              onClick={() => {
                openCreateAdminModal();
              }}
            >
              <span className="material-symbols-outlined text-sm">person_add</span>
              New Admin
            </button>
          </div>
        </header>

        <div className="relative min-h-screen overflow-hidden bg-[#f5f7f9] p-4 sm:p-6 lg:p-12">
          <div className="pointer-events-none absolute -mr-16 -mt-16 right-0 top-0 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(0,82,208,0.08)_0%,rgba(245,247,249,0)_70%)] sm:-mr-48 sm:-mt-48 sm:h-[600px] sm:w-[600px]" />
          <Outlet context={{ adminUsersVersion, openCreateAdminModal, searchQuery, setSearchQuery }} />
        </div>
      </main>

      <AdminAccountModal
        errorMessage={createAdminError}
        isOpen={isCreateAdminModalOpen}
        isSubmitting={isCreateAdminSubmitting}
        mode="create"
        onClose={closeCreateAdminModal}
        onSubmit={(values) => {
          void handleCreateAdmin({
            email: values.email,
            name: values.name,
            password: values.password ?? '',
            username: values.username,
          });
        }}
      />
    </div>
  );
}
