const steps = [
  {
    title: 'Add the extension',
    description: 'Install EZ-CRYPT0 in your browser in seconds.',
  },
  {
    title: 'Save your addresses',
    description: 'Add or import your crypto wallets with labels.',
  },
  {
    title: 'Access anytime',
    description: 'Open your extension and manage everything instantly.',
  },
];

export function HowItWorks() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {steps.map((step, index) => (
        <article
          key={step.title}
          className={[
            'rounded-xl bg-white px-8 py-8 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]',
            index === 1 ? 'lg:translate-y-5' : '',
            index === 2 ? 'lg:translate-y-2' : '',
          ].join(' ')}
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#ebf5ff] text-sm font-semibold text-[#0066ff]">
            {index + 1}
          </span>
          <h3 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900 [font-family:Manrope,sans-serif]">
            {step.title}
          </h3>
          <p className="mt-3 text-base leading-8 text-[#4b5563]">{step.description}</p>
        </article>
      ))}
    </div>
  );
}
