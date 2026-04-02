export interface AdminStatCardProps {
  label: string;
  meta?: string;
  value: string;
}

export function AdminStatCard({ label, meta, value }: AdminStatCardProps) {
  return (
    <article className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-5">
      <p className="text-sm font-medium text-neutral-400">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-white">{value}</p>
      {meta ? <p className="mt-2 text-sm text-amber-300">{meta}</p> : null}
    </article>
  );
}
