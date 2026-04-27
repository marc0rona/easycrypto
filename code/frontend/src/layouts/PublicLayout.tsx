import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';

import { Loader } from '../components/ui/Loader';
import { useAuth } from '../hooks/useAuth';

const publicLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/register', label: 'Get Started', end: false },
  { to: '/login', label: 'Login', end: false },
] as const;

export function PublicLayout() {
  const location = useLocation();
  const { isAuthenticated, loading, user } = useAuth();
  const isLandingPage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  const authenticatedRedirect = user?.role === 'admin' ? '/admin' : '/dashboard';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7f9] text-[#2c2f31]">
        <Loader className="min-h-screen" message="Loading application..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate replace to={authenticatedRedirect} />;
  }

  const marketingHeader = (cta?: { label: string; to: string }) => (
    <header className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5 md:px-12">
        <div className="flex items-center gap-2">
          <NavLink className="text-base font-extrabold tracking-tight text-[#0066ff] [font-family:Manrope,sans-serif] sm:text-xl" to="/">
            EZ-CRYPT0
          </NavLink>
        </div>

        {cta ? (
          <NavLink
            className="rounded-full bg-[#0066ff] px-5 py-2 text-xs font-bold text-white shadow-lg shadow-[#0066ff]/20 transition-all hover:bg-blue-700 active:scale-95 sm:px-7 sm:py-2.5 sm:text-sm"
            to={cta.to}
          >
            {cta.label}
          </NavLink>
        ) : (
          <div aria-hidden="true" className="h-9 w-20 sm:h-10 sm:w-[108px]" />
        )}
      </div>
    </header>
  );

  const marketingFooter = (compact = false) => (
    <footer
      className={[
        'w-full border-t border-blue-100 bg-[#e1efff]',
        compact ? 'py-4 sm:py-5' : 'py-8',
      ].join(' ')}
    >
      <div
        className={[
          'mx-auto flex max-w-7xl flex-col items-center justify-between px-4 sm:px-8 md:flex-row',
          compact ? 'gap-3' : 'gap-4',
        ].join(' ')}
      >
        <div>
          <span className="text-sm font-extrabold uppercase tracking-tight text-slate-800 [font-family:Manrope,sans-serif]">
            EZ-CRYPT0
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-medium text-slate-500 sm:gap-8">
          <a className="transition-colors hover:text-[#0066ff]" href="#privacy">
            Privacy
          </a>
          <a className="transition-colors hover:text-[#0066ff]" href="#terms">
            Terms
          </a>
          <a className="transition-colors hover:text-[#0066ff]" href="#contact">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );

  if (isLandingPage) {
    return (
      <div className="min-h-screen bg-white text-slate-950">
        {marketingHeader({ label: 'Sign in', to: '/login' })}

        <main>
          <Outlet />
        </main>

        {marketingFooter()}
      </div>
    );
  }

  if (isLoginPage) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f5f7f9] text-[#2c2f31]">
        {marketingHeader({ label: 'Sign up', to: '/register' })}

        <main className="relative flex flex-1 items-start justify-center overflow-hidden px-4 pb-6 pt-24 sm:items-center sm:px-6 sm:pb-8 sm:pt-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,142,255,0.15)_0%,rgba(245,247,249,0)_70%)]"
          />
          <div className="z-10 w-full max-w-md">
            <Outlet />
          </div>
        </main>

        <div
          aria-hidden="true"
          className="pointer-events-none fixed bottom-0 left-0 -z-10 h-1/3 w-full bg-gradient-to-t from-[#d5e4f7]/20 to-transparent"
        />

        {marketingFooter(true)}
      </div>
    );
  }

  if (isRegisterPage) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f5f7f9] text-[#2c2f31]">
        {marketingHeader({ label: 'Sign in', to: '/login' })}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(121,157,255,0.1)_0%,rgba(245,247,249,0)_70%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-[#0052d0]/5 blur-[100px] sm:-right-24 sm:-top-24 sm:h-96 sm:w-96"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-[#d5e4f7]/20 blur-[100px] sm:-bottom-24 sm:-left-24 sm:h-96 sm:w-96"
        />

        <main className="relative z-10 flex w-full flex-1 items-center px-4 pb-4 pt-20 sm:px-6 sm:pb-5 sm:pt-[5.5rem]">
          <div className="mx-auto w-full max-w-[1320px]">
            <Outlet />
          </div>
        </main>

        {marketingFooter(true)}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060913] text-slate-50">
      <div className="layout-shell layout-shell--public flex min-h-screen flex-col">
        <header className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[rgba(16,22,35,0.78)] px-4 py-4 backdrop-blur-xl sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <NavLink className="text-xl font-semibold tracking-[-0.04em] text-white" to="/">
              EZ-CRYPT0
            </NavLink>
            <span className="hidden text-sm text-slate-500 md:block">
              Browser extension for crypto address organization
            </span>
          </div>

          <nav aria-label="Public navigation" className="flex flex-wrap items-center gap-2">
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                className={({ isActive }) =>
                  [
                    'rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-cyan-400 text-slate-950'
                      : 'text-slate-300 hover:bg-white/8 hover:text-white',
                  ].join(' ')
                }
                end={link.end}
                to={link.to}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="flex flex-1 items-start py-8 sm:py-12">
          <div className="w-full">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-white/8 pt-6 text-sm text-slate-500">
          EZ-CRYPT0 public experience
        </footer>
      </div>
    </div>
  );
}
