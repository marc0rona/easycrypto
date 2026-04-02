export interface StatCardProps {
  label: string;
  meta?: string;
  value: string;
}

export function StatCard({ label, meta, value }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-white">{value}</p>
      {meta ? <p className="mt-2 text-sm text-cyan-300">{meta}</p> : null}
    </article>
  );
}
