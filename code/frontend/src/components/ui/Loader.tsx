export interface LoaderProps {
  className?: string;
  message?: string;
}

export function Loader({ className = '', message = 'Loading...' }: LoaderProps) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center gap-4 px-6 py-14 text-center',
        className,
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400 shadow-[0_0_24px_rgba(56,189,248,0.18)]"
      />
      <p className="text-sm font-medium text-slate-300">{message}</p>
    </div>
  );
}
