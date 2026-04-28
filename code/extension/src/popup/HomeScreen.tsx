import type { ReactNode } from 'react';

import { ActionButtons } from './ActionButtons';
import { MarketPanel } from './MarketPanel';

interface HomeScreenProps {
  themeToggleControl: ReactNode;
  onLogout: () => void;
  onOpenMarket: () => void;
  onOpenReceive: () => void;
  onOpenSave: () => void;
  onOpenSend: () => void;
  onOpenSwap: () => void;
}

export function HomeScreen({
  themeToggleControl,
  onLogout,
  onOpenMarket,
  onOpenReceive,
  onOpenSave,
  onOpenSend,
  onOpenSwap,
}: HomeScreenProps) {
  return (
    <section className="popup-screen popup-screen--home popup-scroll">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="brand-pillar" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200/75">
              EZ-CRYPT0
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {themeToggleControl}
          <button className="popup-ghost-button shrink-0" onClick={onLogout} type="button">
            Logout
          </button>
        </div>
      </div>

      <div className="popup-screen__body popup-screen__body--top">
        <div className="space-y-4">
          <ActionButtons
            isMarketOpen={false}
            isReceiveOpen={false}
            isSaveOpen={false}
            isSendOpen={false}
            isSwapOpen={false}
            onMarketClick={onOpenMarket}
            onReceiveClick={onOpenReceive}
            onSendClick={onOpenSend}
            onSwapClick={onOpenSwap}
            onToggleSave={onOpenSave}
          />

          <section className="home-market-preview">
            <p className="home-market-preview__title">Market Cap</p>
            <MarketPanel isOpen />
          </section>
        </div>
      </div>
    </section>
  );
}
