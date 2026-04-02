import { NavLink, Outlet } from 'react-router-dom';

const dashboardLinks = [
  { to: '/dashboard', label: 'Dashboard', end: true },
  { to: '/dashboard/addresses', label: 'Addresses', end: false },
  { to: '/dashboard/profile', label: 'Profile', end: false },
] as const;

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-white/10 bg-slate-900/80 px-5 py-6 backdrop-blur lg:border-b-0 lg:border-r">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">User app</p>
            <h1 className="mt-3 text-xl font-semibold text-white">EZ-CRYPT0</h1>
          </div>

          <nav aria-label="Dashboard navigation" className="flex flex-col gap-2">
            {dashboardLinks.map((link) => (
              <NavLink
                key={link.to}
                className={({ isActive }) =>
                  [
                    'rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                    isActive ? 'bg-cyan-400 text-slate-950' : 'text-slate-300 hover:bg-white/8 hover:text-white',
                  ].join(' ')
                }
                end={link.end}
                to={link.to}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="border-b border-white/10 px-6 py-4">
            <p className="text-sm text-slate-400">Dashboard workspace</p>
          </header>

          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
