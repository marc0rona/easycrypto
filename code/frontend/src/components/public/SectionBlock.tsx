import type { ReactNode } from 'react';

export interface SectionBlockProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function SectionBlock({ eyebrow, title, description, children }: SectionBlockProps) {
  return (
    <section className="grid gap-8 rounded-3xl border border-white/10 bg-white/[0.02] px-6 py-10 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">{eyebrow}</p>
        ) : null}
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">{title}</h2>
        {description ? <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">{description}</p> : null}
      </div>

      <div>{children}</div>
    </section>
  );
}
