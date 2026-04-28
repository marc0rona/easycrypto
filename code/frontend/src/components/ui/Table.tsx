import type { HTMLAttributes, PropsWithChildren, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';

export function TableShell({
  children,
  className = '',
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={[
        'overflow-hidden rounded-2xl border border-white/10 bg-[rgba(18,23,35,0.78)] shadow-[0_18px_60px_rgba(3,7,18,0.30)]',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

export function Table({
  children,
  className = '',
  ...props
}: PropsWithChildren<TableHTMLAttributes<HTMLTableElement>>) {
  return (
    <table className={['min-w-full border-collapse', className].join(' ')} {...props}>
      {children}
    </table>
  );
}

export function TableHead({
  children,
  className = '',
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLTableSectionElement>>) {
  return (
    <thead className={['bg-white/[0.03]', className].join(' ')} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({
  children,
  className = '',
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLTableSectionElement>>) {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({
  children,
  className = '',
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLTableRowElement>>) {
  return (
    <tr
      className={[
        'border-t border-white/8 transition-colors duration-200 hover:bg-white/[0.03]',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHeaderCell({
  children,
  className = '',
  ...props
}: PropsWithChildren<ThHTMLAttributes<HTMLTableCellElement>>) {
  return (
    <th
      className={[
        'px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({
  children,
  className = '',
  ...props
}: PropsWithChildren<TdHTMLAttributes<HTMLTableCellElement>>) {
  return (
    <td className={['px-5 py-4 align-middle', className].join(' ')} {...props}>
      {children}
    </td>
  );
}
