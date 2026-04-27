import type { ReactNode } from 'react';

interface ActionButtonsProps {
  isMarketOpen: boolean;
  isReceiveOpen: boolean;
  isSaveOpen: boolean;
  isSendOpen: boolean;
  isSwapOpen: boolean;
  onReceiveClick: () => void;
  onSendClick: () => void;
  onToggleSave: () => void;
  onSwapClick: () => void;
  onMarketClick: () => void;
}

interface ActionTileProps {
  active?: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

function ActionTile({ active = false, icon, label, onClick }: ActionTileProps) {
  return (
    <button
      aria-pressed={active}
      className={`action-tile${active ? ' action-tile--active' : ''}`}
      onClick={onClick}
      type="button"
    >
      <span className="action-tile__icon-shell" aria-hidden="true">
        {icon}
      </span>
      <span className="action-tile__label">{label}</span>
    </button>
  );
}

interface SaveHeroProps {
  active?: boolean;
  onClick: () => void;
}

function SaveHero({ active = false, onClick }: SaveHeroProps) {
  return (
    <button
      aria-pressed={active}
      className={`save-hero${active ? ' save-hero--active' : ''}`}
      onClick={onClick}
      type="button"
    >
      <span className="save-hero__art" aria-hidden="true">
        <span className="save-hero__art-orb save-hero__art-orb--left" />
        <span className="save-hero__art-orb save-hero__art-orb--right" />
        <span className="save-hero__art-core">
          <BitcoinIcon />
        </span>
      </span>

      <span className="save-hero__copy">
        <span className="save-hero__title">Save your addresses</span>
      </span>

      <span className="save-hero__cta">Save</span>
    </button>
  );
}

function BitcoinIcon() {
  return (
    <svg
      className="h-10 w-10"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" fill="#F7931A" />
      <path
        d="M13.7 6.6c1.7.3 2.6 1.3 2.8 2.7.2 1.3-.3 2.2-1.4 2.9 1.5.4 2.2 1.4 2.1 3 0 2.2-1.7 3.5-4.7 3.7V21h-1.4v-2.2h-1V21H8.8v-2.2H7.1v-1.5h1V9.1h-1V7.6h1.7V5.4h1.4v2.2h1V5.4h1.4v1.2Zm-3.6 2.6v2.7h2.3c1.4 0 2.1-.4 2.1-1.4 0-.9-.7-1.3-2.1-1.3Zm0 4.2v3h2.8c1.6 0 2.4-.5 2.4-1.5 0-1-.8-1.5-2.4-1.5Z"
        fill="#fff"
      />
    </svg>
  );
}

function SwapIcon() {
  return (
    <svg
      className="h-5 w-5 text-slate-200"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
      viewBox="0 0 24 24"
    >
      <path d="M7 7h10" />
      <path d="m13.75 3.75 3.5 3.25-3.5 3.25" />
      <path d="M17 17H7" />
      <path d="m10.25 20.25-3.5-3.25 3.5-3.25" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      className="h-5 w-5 text-slate-200"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
      viewBox="0 0 24 24"
    >
      <path d="M7 17 17 7" />
      <path d="M9.75 7h7.25v7.25" />
    </svg>
  );
}

function ReceiveIcon() {
  return (
    <svg
      className="h-5 w-5 text-slate-200"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
      viewBox="0 0 24 24"
    >
      <path d="m17 7-10 10" />
      <path d="M14.25 17H7v-7.25" />
    </svg>
  );
}

export function ActionButtons({
  isReceiveOpen,
  isSaveOpen,
  isSendOpen,
  isSwapOpen,
  onReceiveClick,
  onSendClick,
  onToggleSave,
  onSwapClick,
}: ActionButtonsProps) {
  return (
    <div className="space-y-3">
      <SaveHero active={isSaveOpen} onClick={onToggleSave} />

      <div className="grid grid-cols-3 gap-2">
        <ActionTile active={isSendOpen} icon={<SendIcon />} label="Send" onClick={onSendClick} />
        <ActionTile
          active={isReceiveOpen}
          icon={<ReceiveIcon />}
          label="Receive"
          onClick={onReceiveClick}
        />
        <ActionTile active={isSwapOpen} icon={<SwapIcon />} label="Swap" onClick={onSwapClick} />
      </div>
    </div>
  );
}
