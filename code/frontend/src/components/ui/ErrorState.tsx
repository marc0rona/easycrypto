import { Button } from './Button';
import { Card } from './Card';

export interface ErrorStateProps {
  className?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  title?: string;
}

export function ErrorState({
  className = '',
  message,
  onRetry,
  retryLabel = 'Retry',
  title = 'Something went wrong',
}: ErrorStateProps) {
  return (
    <Card
      className={[
        'p-6',
        className,
      ].join(' ')}
      tone="danger"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-rose-100/90">{message}</p>
        </div>

        {onRetry ? (
          <Button type="button" variant="secondary" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
