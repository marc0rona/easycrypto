import { forwardRef, type InputHTMLAttributes } from 'react';

export interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  helperText?: string;
  id: string;
  label: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(function AuthInput(
  { error, helperText, id, label, className = '', ...props },
  ref,
) {
  const describedBy = error ? `${id}-error` : helperText ? `${id}-helper` : undefined;

  return (
    <label className="flex flex-col gap-2" htmlFor={id}>
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <input
        ref={ref}
        id={id}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className={[
          'w-full rounded-2xl border bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition',
          error
            ? 'border-rose-400/70 focus:border-rose-400'
            : 'border-white/10 focus:border-cyan-400/80',
          className,
        ].join(' ')}
        {...props}
      />
      {error ? (
        <span className="text-sm text-rose-300" id={`${id}-error`}>
          {error}
        </span>
      ) : helperText ? (
        <span className="text-sm text-slate-400" id={`${id}-helper`}>
          {helperText}
        </span>
      ) : null}
    </label>
  );
});
