export interface LoaderProps {
  message?: string;
}

export function Loader({ message = 'Loading...' }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
      <span
        aria-hidden="true"
        className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400/25 border-t-cyan-400"
      />
      <p className="text-sm font-medium text-slate-300">{message}</p>
    </div>
  );
}
