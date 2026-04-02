import { useNavigate } from 'react-router-dom';

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-16 sm:px-10 sm:py-20">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-cyan-400/10 via-sky-400/5 to-transparent"
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
          Crypto workspace
        </span>

        <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Manage All Your Crypto Addresses in One Place
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
          Too many wallets, too many copied addresses, and no clear way to track them. EZ-CRYPT0
          gives you one place to collect, organize, and manage the addresses you use every day.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <button
            className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            type="button"
            onClick={() => navigate('/download')}
          >
            Download Extension
          </button>

          <button
            className="rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
            type="button"
            onClick={() => navigate('/register')}
          >
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
}
