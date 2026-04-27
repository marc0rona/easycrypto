import type { ReactNode } from 'react';

export interface DashboardHeaderProps {
  actions?: ReactNode;
  eyebrow?: string;
  sticky?: boolean;
  subtitle: string;
  title: string;
}

export function DashboardHeader({
  actions,
  eyebrow,
  sticky = true,
  subtitle,
  title,
}: DashboardHeaderProps) {
  return (
    <div
      className={[
        'space-y-4',
        sticky
          ? 'sticky top-0 z-20 -mx-1 border-b border-white/6 bg-[#060913]/90 px-1 pb-5 pt-2 backdrop-blur-xl'
          : '',
      ].join(' ')}
    >
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">{eyebrow}</p>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
          <p className="max-w-2xl text-base leading-8 text-slate-400">{subtitle}</p>
        </div>

        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}
