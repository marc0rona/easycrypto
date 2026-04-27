import { useCallback, useMemo, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';

const dashboardLinks = [
  { icon: 'space_dashboard', label: 'Dashboard', to: '/dashboard', end: true },
  { icon: 'person', label: 'Profile', to: '/dashboard/profile', end: false },
] as const;

const profileImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD_a4VtTaFgcwUiyFpNWuKKIKvd9PgC98DiFJKA_iHHrZ-HDmztoPtq1bPs5A3v2UVAVDZp_zkySBwEdSklpUfknTzbWzFN2EmdFDuofeELNAmFiqWvdzsiuEq8ubfGn1fea1SiBtzIRsb17B91C2AIkXniauhORGXaNEWkGLCIs18Y1N77SJiQa3p2nnpOTs7IooMXWZ26y1l8spW1lvwiJWtmyvbVNeee_pEpZhs1tGGPZCi1vz9G9VgphgLylCc9wyFJTpIPybQ9';

export function DashboardLayout() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);

    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Failed to log out from the dashboard.', error);
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout, navigate]);

  const accountLabel = useMemo(() => {
    if (!user) {
      return 'Workspace';
    }

    return user.role === 'admin' ? 'Admin Access' : 'Pro Plan';
  }, [user]);

  const displayName = useMemo(() => {
    if (user?.name?.trim()) {
      return user.name.trim();
    }

    if (user?.username?.trim()) {
      return user.username.trim();
    }

    if (user?.email?.trim()) {
      return user.email.split('@')[0];
    }

    return 'User';
  }, [user]);

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f7f9] text-[#2c2f31] antialiased lg:flex-row">
      <aside className="z-50 flex h-auto w-full flex-col border-b border-slate-200/60 bg-slate-50 p-4 sm:p-6 lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-64 lg:border-b-0">
        <div className="mb-12">
          <span className="text-lg font-extrabold tracking-tight text-blue-600">EZ-CRYPT0</span>
        </div>

        <nav aria-label="Dashboard navigation" className="flex flex-1 flex-wrap gap-2 lg:block lg:space-y-2">
          {dashboardLinks.map((link) => (
            <NavLink
              key={link.to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200',
                  isActive
                    ? 'bg-blue-50 font-bold text-blue-600'
                    : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900',
                ].join(' ')
              }
              end={link.end}
              to={link.to}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 border-t border-transparent pt-6 lg:mt-auto">
          <div className="mb-6 flex items-center gap-3 px-2 lg:mb-8">
            <img alt={displayName} className="h-10 w-10 rounded-full object-cover" src={profileImage} />
            <div>
              <p className="font-headline text-sm font-bold leading-none text-[#2c2f31]">
                {displayName}
              </p>
              <p className="mt-1 text-xs text-[#595c5e]">{accountLabel}</p>
            </div>
          </div>

          <button
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-500 transition-all duration-200 hover:bg-red-50/50 hover:text-[#b31b25]"
            disabled={isLoggingOut}
            type="button"
            onClick={() => {
              void handleLogout();
            }}
          >
            <span className="material-symbols-outlined">logout</span>
            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </aside>

      <main className="min-h-screen flex-1 lg:ml-64">
        <header className="sticky top-0 z-40 flex w-full items-center justify-center bg-white/70 px-4 py-4 backdrop-blur-xl transition-all duration-300 sm:px-6 lg:justify-end lg:px-8">
          <div className="flex items-center gap-4">
            <button
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#0052d0_0%,#799dff_100%)] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto sm:px-6"
              type="button"
              onClick={() => {
                navigate('/dashboard?modal=add');
              }}
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add Address
            </button>
          </div>
        </header>

        <Outlet />
      </main>

      <button
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0052d0_0%,#799dff_100%)] text-white shadow-xl transition-transform hover:scale-105 active:scale-95 sm:bottom-8 sm:right-8 sm:h-14 sm:w-14"
        type="button"
        onClick={() => {
          navigate('/dashboard?modal=add');
        }}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
          add
        </span>
      </button>
    </div>
  );
}
