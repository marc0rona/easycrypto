const features = [
  'Save unlimited addresses',
  'Label and organize by coin',
  'Real-time crypto data (prices & trends)',
  'Duplicate prevention',
  'Clipboard auto-detection',
  'Fast search & filters',
  'Clean portfolio overview',
];

export function Features() {
  return (
    <div className="grid gap-x-12 gap-y-4 sm:grid-cols-2">
      {features.map((feature, index) => (
        <div
          key={feature}
          className={[
            'flex items-start gap-3 rounded-xl bg-white px-5 py-4 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]',
            index % 2 === 1 ? 'sm:translate-y-4' : '',
          ].join(' ')}
        >
          <span className="mt-[10px] inline-flex h-2.5 w-2.5 rounded-full bg-[#0066ff]" />
          <p className="text-[17px] leading-7 text-[#283548]">{feature}</p>
        </div>
      ))}
    </div>
  );
}
