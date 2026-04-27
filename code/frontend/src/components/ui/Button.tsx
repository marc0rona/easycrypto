import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    PropsWithChildren {
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'danger' | 'primary' | 'secondary';
}

export function Button({
  children,
  className = '',
  fullWidth = false,
  size = 'md',
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  const sizeClassName =
    size === 'sm'
      ? 'px-4 py-2.5 text-sm'
      : size === 'lg'
        ? 'px-6 py-3.5 text-base'
        : 'px-5 py-3 text-sm';

  const variantClassName =
    variant === 'secondary'
      ? 'border border-white/10 bg-white/[0.04] text-slate-100 hover:border-white/15 hover:bg-white/[0.07]'
      : variant === 'danger'
        ? 'border border-rose-400/20 bg-rose-500/12 text-rose-100 hover:border-rose-400/30 hover:bg-rose-500/18'
        : 'bg-cyan-400 text-slate-950 hover:bg-cyan-300';

  return (
    <button
      className={[
        'inline-flex items-center justify-center rounded-xl font-semibold shadow-[0_10px_30px_rgba(5,8,20,0.28)] transition-all duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'active:scale-[0.985] hover:-translate-y-px',
        sizeClassName,
        variantClassName,
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
