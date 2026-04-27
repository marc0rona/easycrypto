import { downloadChromeExtension } from '../../config/downloads';
import { Button } from '../ui/Button';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#dce9fb] px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-24 lg:px-14 lg:pb-36 lg:pt-28">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[34%] h-56 w-56 -translate-x-1/2 rounded-full bg-[#2f6bff]/55 blur-[95px] sm:h-72 sm:w-72"
      />
      <div
        aria-hidden="true"
        className="absolute left-[18%] top-[18%] h-40 w-40 rounded-full bg-white/45 blur-[90px] sm:h-56 sm:w-56"
      />

      <div className="relative mx-auto max-w-5xl text-center">
        <p className="mx-auto inline-flex rounded-full border border-[#8db2ff]/60 bg-white/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#2359d6]">
          Browser extension
        </p>

        <h1 className="mx-auto mt-8 max-w-5xl break-words text-balance text-[2.5rem] font-extrabold leading-[1.05] tracking-tight text-slate-900 [font-family:Manrope,sans-serif] sm:mt-10 sm:text-6xl lg:text-[5.45rem]">
          Organize Your Crypto <br />
          <span className="text-[#0066ff]">Addresses. Effortlessly.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#4b5563] sm:mt-8 sm:text-xl">
          Save, manage, and access all your wallet addresses in one secure place directly from your browser.
        </p>

        <div className="mx-auto mt-10 flex max-w-sm items-center justify-center sm:mt-12 sm:max-w-none">
          <Button
            className="w-full gap-3 rounded-lg bg-[#0066ff] px-6 py-4 text-base font-bold text-white shadow-xl shadow-[#0066ff]/25 hover:bg-blue-700 sm:min-w-[250px] sm:px-10 sm:py-5 sm:text-lg"
            size="lg"
            onClick={() => {
              downloadChromeExtension();
            }}
          >
            <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" fill="currentColor" opacity="0.24" r="10" />
              <path
                d="M12 7.25c.414 0 .75.336.75.75v3.25H16a.75.75 0 0 1 0 1.5h-3.25V16a.75.75 0 0 1-1.5 0v-3.25H8a.75.75 0 0 1 0-1.5h3.25V8c0-.414.336-.75.75-.75Z"
                fill="currentColor"
              />
            </svg>
            Add to Chrome
          </Button>
        </div>
      </div>
    </section>
  );
}
