import { useNavigate } from 'react-router-dom';

export function FinalCta() {
  const navigate = useNavigate();

  return (
    <section className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 px-6 py-12 text-center sm:px-10">
      <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Start organizing your crypto today
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-200">
        Install the extension, detect addresses as you browse, and keep everything connected inside
        your EZ-CRYPT0 workspace.
      </p>
      <button
        className="mt-8 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
        type="button"
        onClick={() => navigate('/download')}
      >
        Download Extension
      </button>
    </section>
  );
}
