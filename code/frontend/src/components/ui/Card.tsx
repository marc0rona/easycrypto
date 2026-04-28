import type { HTMLAttributes, PropsWithChildren } from 'react';

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    PropsWithChildren {
  tone?: 'default' | 'muted' | 'accent' | 'danger';
}

export function Card({
  children,
  className = '',
  tone = 'default',
  ...props
}: CardProps) {
  const toneClassName =
    tone === 'muted'
      ? 'border-white/8 bg-[#121826]/78'
      : tone === 'accent'
        ? 'border-cyan-400/15 bg-[rgba(18,32,53,0.82)]'
        : tone === 'danger'
          ? 'border-rose-400/15 bg-[rgba(51,20,29,0.72)]'
          : 'border-white/10 bg-[rgba(18,23,35,0.82)]';

  return (
    <div
      className={[
        'rounded-2xl border p-6 shadow-[0_18px_60px_rgba(3,7,18,0.34)] backdrop-blur-xl',
        toneClassName,
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}
