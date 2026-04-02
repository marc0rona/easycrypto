import { NavLink, Outlet } from 'react-router-dom';

const publicLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/download', label: 'Download', end: false },
  { to: '/login', label: 'Login', end: false },
] as const;

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6">
        <header className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur">
          <NavLink className="text-lg font-semibold tracking-[0.18em] text-white" to="/">
            EZ-CRYPT0
          </NavLink>

          <nav aria-label="Public navigation" className="flex items-center gap-3">
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                className={({ isActive }) =>
                  [
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white',
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

        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-5xl">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-white/10 pt-6 text-center text-sm text-slate-400">
          EZ-CRYPT0 public experience
        </footer>
      </div>
    </div>
  );
}
