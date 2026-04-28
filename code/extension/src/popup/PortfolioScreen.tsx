import type { ReactNode } from 'react';

type AddressDirection = 'RECEIVING' | 'SENDING';

interface PortfolioScreenProps {
  direction: AddressDirection;
  headerAction: ReactNode;
  onAddAddress: () => void;
  onBack: () => void;
  portfolio: ReactNode;
}

export function PortfolioScreen({
  direction,
  headerAction,
  onAddAddress,
  onBack,
  portfolio,
}: PortfolioScreenProps) {
  const isSending = direction === 'SENDING';
  const title = isSending ? 'Send' : 'Receive';

  return (
    <section className="popup-screen page-app">
      <header className="page-app__header">
        <button aria-label="Back" className="page-app__back" onClick={onBack} type="button">
          <svg
            aria-hidden="true"
            fill="none"
            height="20"
            viewBox="0 0 20 20"
            width="20"
          >
            <path
              d="M12.5 4.5L7 10l5.5 5.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </button>
        <h1 className="page-app__title">{title}</h1>
        {headerAction}
      </header>

      <main className="page-app__content popup-scroll">
        <div className="page-app__actions">
          <button
            className="popup-ghost-button popup-ghost-button--sm shrink-0"
            onClick={onAddAddress}
            type="button"
          >
            {isSending ? 'Add Send' : 'Add Receive'}
          </button>
        </div>
        
        {portfolio}
      </main>
    </section>
  );
}
