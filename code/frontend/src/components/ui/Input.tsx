import { forwardRef, type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = '', ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={[
        'w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-all duration-200',
        'placeholder:text-slate-500 focus:border-cyan-400/70 focus:outline-none focus:ring-4 focus:ring-cyan-400/10',
        className,
      ].join(' ')}
      {...props}
    />
  );
});
