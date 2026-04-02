import { NavLink, Outlet } from 'react-router-dom';

const adminLinks = [
  { to: '/admin', label: 'Admin Dashboard', end: true },
  { to: '/admin/users', label: 'Users', end: false },
  { to: '/admin/system', label: 'System Status', end: false },
] as const;

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-amber-400/20 bg-neutral-900 px-5 py-6 lg:border-b-0 lg:border-r">
          <div className="mb-8 rounded-2xl border border-amber-400/15 bg-amber-400/5 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/70">Admin panel</p>
            <h1 className="mt-3 text-xl font-semibold text-white">EZ-CRYPT0 Control</h1>
          </div>

          <nav aria-label="Admin navigation" className="flex flex-col gap-2">
            {adminLinks.map((link) => (
              <NavLink
                key={link.to}
                className={({ isActive }) =>
                  [
                    'rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-amber-300 text-neutral-950'
                      : 'text-neutral-300 hover:bg-white/8 hover:text-white',
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

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
