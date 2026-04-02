import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

export interface AuthButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    PropsWithChildren {}

export function AuthButton({
  children,
  className = '',
  disabled,
  type = 'submit',
  ...props
}: AuthButtonProps) {
  return (
    <button
      className={[
        'w-full rounded-full px-5 py-3 text-sm font-semibold transition',
        disabled
          ? 'cursor-not-allowed bg-slate-700 text-slate-300'
          : 'bg-cyan-400 text-slate-950 hover:bg-cyan-300',
        className,
      ].join(' ')}
      disabled={disabled}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
