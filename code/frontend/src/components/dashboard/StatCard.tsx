import type { HTMLAttributes } from 'react';

import { Card } from '../ui/Card';

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  meta?: string;
  value: string;
}

export function StatCard({ className = '', label, meta, value, ...props }: StatCardProps) {
  return (
    <Card className={['p-6', className].join(' ')} {...props}>
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <p className="mt-5 text-3xl font-semibold tracking-tight text-white">{value}</p>
      {meta ? <p className="mt-3 text-sm leading-6 text-slate-300">{meta}</p> : null}
    </Card>
  );
}
