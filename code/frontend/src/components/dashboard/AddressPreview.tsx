export interface AddressPreviewProps {
  address: string;
  label?: string;
  type: string;
}

export function AddressPreview({ address, label, type }: AddressPreviewProps) {
  return (
    <article className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/70 px-5 py-4">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
            {type}
          </span>
          {label ? <span className="text-sm text-slate-400">{label}</span> : null}
        </div>

        <p className="mt-3 truncate font-mono text-sm text-white">{address}</p>
      </div>

      <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Saved</span>
    </article>
  );
}
