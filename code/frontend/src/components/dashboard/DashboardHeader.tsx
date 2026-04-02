export interface DashboardHeaderProps {
  subtitle: string;
  title: string;
}

export function DashboardHeader({ subtitle, title }: DashboardHeaderProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
      <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{subtitle}</p>
    </div>
  );
}
