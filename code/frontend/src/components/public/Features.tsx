const features = [
  {
    title: 'Secure storage',
    description: 'Store and manage addresses only. EZ-CRYPT0 never stores private keys.',
  },
  {
    title: 'Easy organization',
    description: 'Group and review your saved addresses so they stay searchable and manageable.',
  },
  {
    title: 'Chrome extension detection',
    description: 'Let the extension help detect addresses while you browse and bring them into one flow.',
  },
  {
    title: 'Sync across devices',
    description: 'Keep your workspace consistent so your saved addresses follow you wherever you work.',
  },
] as const;

export function Features() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {features.map((feature) => (
        <article
          key={feature.title}
          className="rounded-2xl border border-white/10 bg-slate-900/70 px-5 py-5"
        >
          <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">{feature.description}</p>
        </article>
      ))}
    </div>
  );
}
