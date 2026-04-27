import { Modal } from './Modal';

export interface ConfirmDialogProps {
  confirmLabel?: string;
  description: string;
  isOpen: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tone?: 'danger' | 'primary';
  title: string;
}

export function ConfirmDialog({
  confirmLabel = 'Confirm',
  description,
  isOpen,
  isSubmitting = false,
  onClose,
  onConfirm,
  tone = 'danger',
  title,
}: ConfirmDialogProps) {
  const actionBaseClassName =
    'inline-flex w-full items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed active:scale-[0.985] sm:w-auto';

  const cancelButtonClassName = [
    actionBaseClassName,
    'border border-[#d7dee6] bg-white text-[#2c2f31] shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:min-w-[150px]',
    'hover:-translate-y-px hover:border-[#c8d1da] hover:bg-[#f8fafc]',
    'focus-visible:ring-[#0052d0]/30',
    'disabled:border-[#e7ecf1] disabled:bg-[#f8fafc] disabled:text-[#9aa4af] disabled:opacity-100',
  ].join(' ');

  const confirmButtonClassName = [
    actionBaseClassName,
    tone === 'danger'
      ? 'border border-[#ffb8c6] bg-[#ffe8ee] text-[#b4233c] shadow-[0_16px_40px_rgba(255,135,160,0.16)] hover:-translate-y-px hover:border-[#ffa3b6] hover:bg-[#ffdfe8] focus-visible:ring-rose-500/30 disabled:border-[#ffd6df] disabled:bg-[#fff1f5] disabled:text-[#d08a99] disabled:opacity-100 sm:min-w-[170px]'
      : 'border border-[#0052d0] bg-[#0052d0] text-white shadow-[0_16px_40px_rgba(0,82,208,0.18)] hover:-translate-y-px hover:border-[#0d5ce0] hover:bg-[#0d5ce0] focus-visible:ring-[#0052d0]/30 disabled:border-[#a8c0ef] disabled:bg-[#a8c0ef] disabled:text-white disabled:opacity-100 sm:min-w-[170px]',
  ].join(' ');

  return (
    <Modal description={description} isOpen={isOpen} onClose={onClose} title={title}>
      <div className="border-t border-[#eef1f3] bg-[#f8fafc] px-5 py-5 sm:px-8">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className={cancelButtonClassName}
            disabled={isSubmitting}
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={confirmButtonClassName}
            disabled={isSubmitting}
            type="button"
            onClick={onConfirm}
          >
            {isSubmitting ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
