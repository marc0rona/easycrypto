import type { HTMLAttributes } from 'react';

import { Card } from '../ui/Card';

export interface AdminStatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  meta?: string;
  value: string;
}

export function AdminStatCard({ className = '', label, meta, value, ...props }: AdminStatCardProps) {
  return (
    <Card className={['p-6', className].join(' ')} tone="muted" {...props}>
      <p className="text-sm font-medium text-neutral-400">{label}</p>
      <p className="mt-5 text-3xl font-semibold tracking-tight text-white">{value}</p>
      {meta ? <p className="mt-3 text-sm leading-6 text-neutral-300">{meta}</p> : null}
    </Card>
  );
}
