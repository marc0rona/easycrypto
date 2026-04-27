import { downloadChromeExtension } from '../../config/downloads';
import { Button } from '../ui/Button';

export function FinalCta() {
  return (
    <section className="rounded-[2rem] bg-[#e7f0ff] px-8 py-14 text-center sm:px-12 sm:py-16">
      <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 [font-family:Manrope,sans-serif] sm:text-[3.4rem]">
        Start organizing your crypto today
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[#4b5563]">
        Takes less than 30 seconds to get started.
      </p>

      <div className="mt-8">
        <Button
          className="min-w-[220px] rounded-lg bg-[#0066ff] px-10 py-5 text-lg font-bold text-white shadow-xl shadow-[#0066ff]/25 hover:bg-blue-700"
          size="lg"
          onClick={() => {
            downloadChromeExtension();
          }}
        >
          Add to Chrome
        </Button>
      </div>
    </section>
  );
}
