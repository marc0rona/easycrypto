const steps = [
  {
    title: 'Install extension',
    description: 'Add the EZ-CRYPT0 Chrome extension in seconds and connect it to your workspace.',
  },
  {
    title: 'Detect addresses automatically',
    description: 'Capture crypto addresses as you browse so nothing important gets lost or duplicated.',
  },
  {
    title: 'Manage them in dashboard',
    description: 'Review, organize, and maintain every saved address from one secure dashboard.',
  },
] as const;

export function HowItWorks() {
  return (
    <div className="grid gap-4">
      {steps.map((step, index) => (
        <article
          key={step.title}
          className="rounded-2xl border border-white/10 bg-slate-900/70 px-5 py-5"
        >
          <div className="flex items-start gap-4">
            <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full bg-cyan-400/15 text-sm font-semibold text-cyan-300">
              {index + 1}
            </span>

            <div>
              <h3 className="text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-300">{step.description}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
