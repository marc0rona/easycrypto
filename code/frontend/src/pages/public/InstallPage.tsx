import { useNavigate } from 'react-router-dom';

const steps = [
  {
    title: 'Open Google Chrome',
    description:
      'Launch Google Chrome on your computer. This installation flow is designed specifically for Chrome.',
  },
  {
    title: 'Go to chrome://extensions/',
    description:
      'Paste chrome://extensions/ into the browser address bar and open the extensions management page.',
  },
  {
    title: 'Enable Developer Mode',
    description:
      'Use the Developer Mode toggle in the top-right corner of the extensions page so Chrome allows manual loading.',
  },
  {
    title: 'Click “Load unpacked”',
    description:
      'Once Developer Mode is enabled, click the “Load unpacked” button that appears near the top of the page.',
  },
  {
    title: 'Select the extension folder',
    description:
      'Choose the EZ-CRYPT0 extension folder you downloaded earlier. Chrome will add it immediately if the folder is correct.',
  },
] as const;

const notes = [
  'Make sure you downloaded the extension first.',
  'Only works on Google Chrome.',
  'Do not disable Developer Mode while using the unpacked extension.',
] as const;

export function InstallPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 pb-4">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-14 text-center sm:px-10">
        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
          Installation guide
        </span>

        <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          How to Install the EZ-CRYPT0 Extension
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
          Follow these steps to install the extension in your Chrome browser.
        </p>
      </section>

      <section className="space-y-4">
        {steps.map((step, index) => (
          <article
            key={step.title}
            className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.02] px-6 py-6 sm:px-8 lg:grid-cols-[minmax(0,1.2fr)_240px]"
          >
            <div className="flex gap-4">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-cyan-400/15 text-sm font-semibold text-cyan-300">
                {index + 1}
              </span>

              <div>
                <h2 className="text-xl font-semibold text-white">{step.title}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">{step.description}</p>
              </div>
            </div>

            <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-slate-900/60 text-center text-sm text-slate-400">
              Screenshot here
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-amber-400/20 bg-amber-400/10 px-6 py-8 sm:px-8">
        <h2 className="text-2xl font-semibold text-white">Important Notes</h2>
        <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-200">
          {notes.map((note) => (
            <li key={note} className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3">
              {note}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-white/[0.02] px-6 py-10 text-center sm:flex-row sm:px-8">
        <button
          className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          type="button"
          onClick={() => navigate('/login')}
        >
          Go to Dashboard
        </button>

        <button
          className="rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
          type="button"
          onClick={() => navigate('/download')}
        >
          Back to Download
        </button>
      </section>
    </div>
  );
}
