import { useNavigate } from 'react-router-dom';

export function DownloadPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 pb-4 text-center">
      <section className="w-full rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-14 sm:px-10">
        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
          Chrome extension
        </span>

        <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Download the EZ-CRYPT0 Extension
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
          Install the extension to automatically detect and save crypto addresses while browsing.
        </p>
      </section>

      <section className="w-full max-w-2xl rounded-3xl border border-cyan-400/20 bg-cyan-400/10 px-6 py-8 sm:px-8">
        <div className="flex flex-col items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/70">
            <svg aria-hidden="true" className="h-10 w-10 text-cyan-300" viewBox="0 0 24 24">
              <path
                d="M12 3.25a8.75 8.75 0 1 0 8.75 8.75A8.76 8.76 0 0 0 12 3.25Zm0 15.5a6.75 6.75 0 1 1 6.75-6.75A6.76 6.76 0 0 1 12 18.75Z"
                fill="currentColor"
              />
              <circle cx="12" cy="12" r="3.3" fill="currentColor" opacity="0.45" />
            </svg>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white">Chrome Extension</h2>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Download the EZ-CRYPT0 extension now. Later this button will connect directly to the
              Chrome Web Store.
            </p>
          </div>

          <button
            className="rounded-full bg-cyan-400 px-7 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            type="button"
            onClick={() => window.alert('Download started soon')}
          >
            Download Extension
          </button>
        </div>
      </section>

      <section className="grid w-full gap-4 rounded-3xl border border-white/10 bg-white/[0.02] px-6 py-10 text-left sm:px-8 md:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
          <span className="text-sm font-semibold text-cyan-300">01</span>
          <h3 className="mt-3 text-lg font-semibold text-white">Download extension</h3>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            Start by downloading the EZ-CRYPT0 Chrome extension to your browser.
          </p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
          <span className="text-sm font-semibold text-cyan-300">02</span>
          <h3 className="mt-3 text-lg font-semibold text-white">Install it in Chrome</h3>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            Add the extension to Chrome and pin it so it is always available while browsing.
          </p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
          <span className="text-sm font-semibold text-cyan-300">03</span>
          <h3 className="mt-3 text-lg font-semibold text-white">Connect your account</h3>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            Sign in and connect your workspace so detected addresses can flow into your dashboard.
          </p>
        </article>
      </section>

      <section className="w-full rounded-3xl border border-white/10 bg-white/[0.02] px-6 py-10 sm:px-8">
        <h2 className="text-2xl font-semibold text-white">What happens next</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
          After downloading the extension, the next step is a quick installation flow in Chrome so
          you can start detecting and organizing addresses with EZ-CRYPT0.
        </p>

        <button
          className="mt-8 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
          type="button"
          onClick={() => navigate('/install')}
        >
          Installation Guide
        </button>
      </section>
    </div>
  );
}
