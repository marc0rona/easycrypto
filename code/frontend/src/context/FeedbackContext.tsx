import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

type FeedbackTone = 'error' | 'success';

interface FeedbackToast {
  id: number;
  message: string;
  tone: FeedbackTone;
}

interface FeedbackContextValue {
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
}

const FEEDBACK_DURATION = 3200;

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

function getToastClasses(tone: FeedbackTone) {
  return tone === 'success'
    ? 'border-emerald-200/80 bg-white/95 text-slate-900 shadow-[0_24px_70px_rgba(16,185,129,0.14)]'
    : 'border-rose-200/80 bg-white/95 text-slate-900 shadow-[0_24px_70px_rgba(244,63,94,0.14)]';
}

function getAccentClasses(tone: FeedbackTone) {
  return tone === 'success' ? 'bg-emerald-500' : 'bg-rose-500';
}

function getTitle(tone: FeedbackTone) {
  return tone === 'success' ? 'Success' : 'Something went wrong';
}

function getIcon(tone: FeedbackTone) {
  return tone === 'success' ? 'check_circle' : 'error';
}

export function FeedbackProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<FeedbackToast[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, tone: FeedbackTone) => {
      const trimmedMessage = message.trim();

      if (!trimmedMessage) {
        return;
      }

      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((previous) => [...previous, { id, message: trimmedMessage, tone }]);

      window.setTimeout(() => {
        dismissToast(id);
      }, FEEDBACK_DURATION);
    },
    [dismissToast],
  );

  useEffect(
    () => () => {
      setToasts([]);
    },
    [],
  );

  const value = useMemo<FeedbackContextValue>(
    () => ({
      showError: (message: string) => {
        showToast(message, 'error');
      },
      showSuccess: (message: string) => {
        showToast(message, 'success');
      },
    }),
    [showToast],
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 top-5 z-[140] flex justify-center px-4 sm:inset-x-auto sm:right-6 sm:top-6 sm:justify-end">
        <div className="flex w-full max-w-sm flex-col gap-3">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={[
                'pointer-events-auto relative overflow-hidden rounded-[22px] border px-5 py-4 backdrop-blur-xl',
                getToastClasses(toast.tone),
              ].join(' ')}
              role="status"
            >
              <span
                className={[
                  'absolute inset-y-0 left-0 w-1.5 rounded-l-2xl',
                  getAccentClasses(toast.tone),
                ].join(' ')}
              />
              <div className="flex items-start gap-3 pl-3">
                <div
                  className={[
                    'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl',
                    toast.tone === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600',
                  ].join(' ')}
                >
                  <span className="material-symbols-outlined text-[20px]">{getIcon(toast.tone)}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{getTitle(toast.tone)}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{toast.message}</p>
                </div>

                <button
                  aria-label="Dismiss notification"
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  type="button"
                  onClick={() => {
                    dismissToast(toast.id);
                  }}
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </FeedbackContext.Provider>
  );
}

export function useFeedbackContext() {
  const context = useContext(FeedbackContext);

  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider.');
  }

  return context;
}
