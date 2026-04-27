import type { PropsWithChildren } from 'react';

export interface ModalProps extends PropsWithChildren {
  children: React.ReactNode;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export function Modal({
  children,
  description,
  isOpen,
  onClose,
  title,
}: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#0b0f10]/40 px-4 py-4 backdrop-blur-sm sm:items-center sm:px-6 sm:py-6">
      <div className="relative max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-xl border border-[#abadaf]/10 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:max-h-[calc(100vh-3rem)]">
        <button
          aria-label="Close modal"
          className="absolute right-5 top-5 text-[#595c5e] transition-colors hover:text-[#2c2f31] sm:right-6 sm:top-6"
          type="button"
          onClick={onClose}
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="px-5 pb-5 pt-9 sm:px-8 sm:pb-6 sm:pt-10">
          <h2 className="font-headline text-xl font-bold tracking-tight text-[#2c2f31] sm:text-2xl">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-[#595c5e]">{description}</p>
          ) : null}
        </div>

        {children}
      </div>
    </div>
  );
}
