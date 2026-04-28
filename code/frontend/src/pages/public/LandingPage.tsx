import { useEffect, useState } from 'react';

import chromeIcon from '../../assets/chrome-icon.png';
import screen1 from '../../assets/screenshots/screen1.png';
import screen2 from '../../assets/screenshots/screen2.png';
import screen3 from '../../assets/screenshots/screen3.png';
import screen4 from '../../assets/screenshots/screen4.png';
import { downloadChromeExtension } from '../../config/downloads';

const whyItems = [
  {
    title: 'No More Address Fatigue',
    description:
      'Find exactly what you need in seconds. EZ-CRYPT0 keeps all your wallet destinations in one reliable place so you stop wasting time hunting through notes and chats.',
  },
  {
    title: 'A cleaner workflow for every address',
    description:
      'Save receiving or sending addresses with clear labels, coin tags, and guided inputs so your crypto data stays readable, organized, and ready to use.',
  },
  {
    title: 'Fast context without leaving the browser',
    description:
      'Check saved addresses, live markets, and swap previews right inside a lightweight extension so the essentials are always close at hand.',
  },
] as const;

const showcaseItems = [
  {
    image: screen1,
    title: 'Home',
    caption: 'Your crypto hub, right in your browser',
    glowClassName:
      'shadow-[0_28px_64px_rgba(30,99,240,0.20),0_0_0_1px_rgba(131,165,245,0.42)]',
    labelClassName: 'text-[#1f63f0]',
    rotationClassName: 'lg:-rotate-[2.5deg] lg:translate-y-3',
  },
  {
    image: screen2,
    title: 'Save',
    caption: 'Capture addresses with a clean, guided workflow',
    glowClassName:
      'shadow-[0_28px_64px_rgba(96,141,247,0.22),0_0_0_1px_rgba(163,189,255,0.46)]',
    labelClassName: 'text-[#4b7df2]',
    rotationClassName: 'lg:-rotate-[0.7deg] lg:translate-y-1.5',
  },
  {
    image: screen3,
    title: 'Market Cap',
    caption: 'Live market data, always one click away',
    glowClassName:
      'shadow-[0_28px_64px_rgba(71,173,133,0.18),0_0_0_1px_rgba(148,208,183,0.42)]',
    labelClassName: 'text-[#228453]',
    rotationClassName: 'lg:rotate-[0.7deg] lg:translate-y-1.5',
  },
  {
    image: screen4,
    title: 'Swap',
    caption: 'Convert crypto to USD in real time',
    glowClassName:
      'shadow-[0_28px_64px_rgba(124,108,255,0.18),0_0_0_1px_rgba(183,175,255,0.44)]',
    labelClassName: 'text-[#5968f7]',
    rotationClassName: 'lg:rotate-[2.5deg] lg:translate-y-3',
  },
] as const;

const downloadCards = [
  {
    title: 'Web app',
    iconAccentClassName: 'text-[#1f63f0]',
    secondaryIconAccentClassName: 'text-[#5f8fff]',
    links: [{ href: '/login', label: 'Open EZ-CRYPT0 dashboard →' }],
  },
  {
    title: 'Extension',
    iconAccentClassName: 'text-[#1f63f0]',
    secondaryIconAccentClassName: 'text-[#38c9a5]',
    links: [
      { href: '#', label: 'Chrome Extension →', onClick: downloadChromeExtension },
    ],
  },
] as const;

function Divider() {
  return (
    <div className="mx-4 h-px bg-[linear-gradient(90deg,transparent,rgba(117,154,214,0.55),transparent)] sm:mx-6 lg:mx-[clamp(16px,5vw,72px)]" />
  );
}

export function LandingPage() {
  const [activeShowcase, setActiveShowcase] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveShowcase((current) => (current + 1) % showcaseItems.length);
    }, 3500);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const activeWhyIndex = activeShowcase % whyItems.length;
  const activeFrameGlow = showcaseItems[activeShowcase].glowClassName;

  return (
    <div className="min-h-screen bg-[#eef5ff] text-slate-900" id="product">
      <div>
        <section className="relative overflow-hidden px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-24 lg:px-[clamp(16px,5vw,72px)] lg:pb-28 lg:pt-28">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-5%,rgba(31,99,240,0.14)_0%,transparent_55%),radial-gradient(ellipse_50%_35%_at_80%_90%,rgba(56,201,165,0.08)_0%,transparent_50%),radial-gradient(ellipse_40%_30%_at_10%_70%,rgba(123,182,255,0.08)_0%,transparent_50%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(rgba(56,106,211,0.10)_1px,transparent_1px)] bg-[length:26px_26px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,black,transparent)] [-webkit-mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,black,transparent)]"
          />

          <div className="relative mx-auto flex min-h-[calc(100vh-7rem)] max-w-6xl flex-col items-center justify-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c5d9ff] bg-white/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1f63f0] shadow-[0_10px_30px_-22px_rgba(31,99,240,0.45)] backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1f63f0] shadow-[0_0_10px_rgba(31,99,240,0.45)]" />
              Browser Extension
            </div>

            <h1 className="mt-8 max-w-5xl text-balance text-[2.6rem] font-extrabold leading-[0.96] tracking-[-0.03em] text-slate-900 [font-family:Manrope,sans-serif] sm:mt-10 sm:text-6xl lg:text-[5.1rem]">
              Organize Your Crypto
              <br />
              <span className="bg-[linear-gradient(115deg,#1f63f0_0%,#38c9a5_55%,#7bb6ff_100%)] bg-clip-text text-transparent">
                Addresses. Effortlessly.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-[28rem] text-base leading-7 text-[#587090] sm:mt-8 sm:text-[17px]">
              Save, manage, and access all your wallet addresses in one secure place directly from your browser.
            </p>

            <div className="mt-10 w-full max-w-[30rem] sm:mt-12">
              <button
                className="flex w-full items-center justify-center gap-3 rounded-[0.85rem] bg-[#1f63f0] px-8 py-4 text-[15px] font-bold text-white shadow-[0_20px_45px_-20px_rgba(31,99,240,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1857da]"
                type="button"
                onClick={() => {
                  downloadChromeExtension();
                }}
              >
                <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-2 14.5v-9l6 4.5-6 4.5Z" />
                </svg>
                Add to Chrome
              </button>
            </div>

            <div className="mt-5 flex w-full max-w-[32rem] flex-col gap-4 rounded-2xl border border-[#d3e3fb] bg-white/70 px-5 py-4 text-left shadow-[0_18px_50px_-30px_rgba(34,68,122,0.3)] backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3 text-[13px] text-[#587090]">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e5f0ff] text-[#1f63f0]">
                  <svg aria-hidden="true" className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
                  </svg>
                </span>
                <span>
                  Want to try the dashboard first without installing anything?
                </span>
              </div>
              <a
                className="shrink-0 text-[12px] font-bold text-[#1f63f0] transition-colors duration-200 hover:text-[#1857da]"
                href="/login"
              >
                Try web access →
              </a>
            </div>
          </div>
        </section>

        <Divider />

        <section
          className="px-4 py-[clamp(64px,9vw,110px)] sm:px-6 lg:px-[clamp(16px,5vw,72px)]"
          id="features"
        >
          <div className="mx-auto max-w-[980px]">
            <h2 className="text-center text-[clamp(22px,3.5vw,36px)] font-extrabold tracking-[-0.025em] text-slate-900 [font-family:Manrope,sans-serif]">
              Why use EZ-CRYPT0 in your workflow?
            </h2>

            <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.98fr)] lg:items-center lg:gap-16">
              <div className="flex flex-col">
                {whyItems.map((item, index) => (
                  <article
                    key={item.title}
                    className={[
                      'relative border-b border-[#d6e4fb] py-6 pl-5 transition-all duration-300',
                      index === 0 ? 'border-t border-[#d6e4fb]' : '',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'absolute bottom-0 left-0 top-0 w-[3px] rounded-r-sm bg-[#1f63f0] transition-opacity duration-300',
                        index === activeWhyIndex ? 'opacity-100' : 'opacity-0',
                      ].join(' ')}
                    />
                    <h3 className="text-[16px] font-bold text-slate-900 [font-family:Manrope,sans-serif]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-7 text-[#5f7597]">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>

              <div className="relative flex items-center justify-center">
                <div className="absolute h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,rgba(31,99,240,0.16)_0%,transparent_72%)]" />
                <div
                  className={[
                    'relative w-full max-w-[420px] overflow-hidden rounded-[1.35rem] border border-[#d7e5fb] bg-white shadow-[0_38px_80px_-42px_rgba(34,68,122,0.38)]',
                    activeFrameGlow,
                  ].join(' ')}
                >
                  <div className="flex items-center gap-2 border-b border-[#e3edf9] bg-[#f8fbff] px-4 py-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                    <div className="ml-3 flex-1 truncate rounded-md bg-white px-3 py-1 text-center text-[10px] text-[#7b91af] shadow-sm">
                      ez-crypt0://dashboard/overview
                    </div>
                  </div>

                  <div className="bg-[linear-gradient(180deg,#edf5ff_0%,#f9fbff_100%)] p-3 sm:p-4">
                    <img
                      alt={`${showcaseItems[activeShowcase].title} screen preview`}
                      className="w-full rounded-[1rem] border border-[#dbe7fb] bg-white object-cover shadow-[0_16px_36px_-26px_rgba(34,68,122,0.34)]"
                      loading="lazy"
                      src={showcaseItems[activeShowcase].image}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Divider />

        <section className="bg-[linear-gradient(180deg,#f4f8ff_0%,#eef5ff_100%)] px-4 py-[clamp(64px,9vw,110px)] sm:px-6 lg:px-[clamp(16px,5vw,72px)]">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <h2 className="text-[clamp(22px,3.5vw,38px)] font-extrabold tracking-[-0.025em] text-slate-900 [font-family:Manrope,sans-serif]">
                  See it in action
                </h2>
                <p className="mt-2 text-[13px] text-[#5f7597]">
                  Everything you need, packed into a lightweight browser extension.
                </p>
              </div>

              <div className="flex gap-2">
                {showcaseItems.map((item, index) => (
                  <button
                    key={item.title}
                    aria-label={`Show ${item.title} screenshot`}
                    className={[
                      'h-2.5 rounded-full transition-all duration-300',
                      index === activeShowcase
                        ? 'w-6 bg-[#1f63f0] shadow-[0_0_12px_rgba(31,99,240,0.35)]'
                        : 'w-2.5 bg-[#cad8ee]',
                    ].join(' ')}
                    type="button"
                    onClick={() => {
                      setActiveShowcase(index);
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {showcaseItems.map((item, index) => {
                const isActive = index === activeShowcase;

                return (
                  <button
                    key={item.title}
                    className={[
                      'group flex cursor-pointer flex-col rounded-none border-none bg-transparent p-0 text-left transition-all duration-500 ease-[cubic-bezier(.34,1.56,.64,1)]',
                      item.rotationClassName,
                      isActive ? 'z-10 scale-[1.02] lg:-translate-y-3 lg:rotate-0' : '',
                    ].join(' ')}
                    type="button"
                    onClick={() => {
                      setActiveShowcase(index);
                    }}
                  >
                    <div
                      className={[
                        'overflow-hidden rounded-[1.15rem] border border-[#d5e3fa] bg-white transition-all duration-300',
                        isActive
                          ? item.glowClassName
                          : 'shadow-[0_18px_40px_-32px_rgba(34,68,122,0.38)]',
                      ].join(' ')}
                    >
                      <img
                        alt={`${item.title} extension screenshot`}
                        className="block w-full"
                        loading="lazy"
                        src={item.image}
                      />
                    </div>

                    <div className={['px-1 pt-4 transition-opacity duration-300', isActive ? 'opacity-100' : 'opacity-60'].join(' ')}>
                      <div className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#7b91af]">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div
                        className={[
                          'mt-1 text-[13px] font-bold [font-family:Manrope,sans-serif]',
                          isActive ? item.labelClassName : 'text-slate-900',
                        ].join(' ')}
                      >
                        {item.title}
                      </div>
                      <p className="mt-1 text-[11px] leading-5 text-[#6d82a0]">
                        {item.caption}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <Divider />

        <section className="px-4 py-[clamp(64px,9vw,110px)] sm:px-6 lg:px-[clamp(16px,5vw,72px)]" id="security">
          <div className="mx-auto max-w-[780px]">
            <h2 className="text-center text-[clamp(22px,3.5vw,36px)] font-extrabold tracking-[-0.025em] text-slate-900 [font-family:Manrope,sans-serif]">
              EZ-CRYPT0 Access
            </h2>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {downloadCards.map((card, index) => (
                <article
                  key={card.title}
                  className="relative overflow-hidden rounded-3xl border border-[#d6e4fb] bg-white px-7 py-8 shadow-[0_28px_60px_-42px_rgba(34,68,122,0.3)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_32px_65px_-38px_rgba(34,68,122,0.34)]"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#7ba8ff,transparent)] opacity-80" />
                  <div className="flex gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#dce8fb] bg-[#f5f9ff] shadow-inner">
                      {index === 0 ? (
                        <svg aria-hidden="true" className={['h-5 w-5', card.iconAccentClassName].join(' ')} fill="none" viewBox="0 0 24 24">
                          <rect x="2.75" y="3.75" width="18.5" height="12.5" rx="2" stroke="currentColor" strokeWidth="1.8" />
                          <path d="M8 20.25h8M12 16.25v4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                        </svg>
                      ) : (
                        <img alt="Chrome" className="h-5 w-5" src={chromeIcon} />
                      )}
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#dce8fb] bg-[#f5f9ff] shadow-inner">
                      {index === 0 ? (
                        <svg aria-hidden="true" className={['h-5 w-5', card.secondaryIconAccentClassName].join(' ')} fill="none" viewBox="0 0 24 24">
                          <rect x="3.5" y="4.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
                          <path d="M7 20h10" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
                        </svg>
                      ) : (
                        <svg aria-hidden="true" className={['h-5 w-5', card.secondaryIconAccentClassName].join(' ')} fill="none" viewBox="0 0 24 24">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                        </svg>
                      )}
                    </div>
                  </div>

                  <h3 className="mt-5 text-[18px] font-bold text-slate-900 [font-family:Manrope,sans-serif]">
                    {card.title}
                  </h3>

                  <div className="mt-4 space-y-2.5">
                    {card.links.map((link) =>
                      'onClick' in link ? (
                        <button
                          key={link.label}
                          className="block text-left text-[13px] font-medium text-[#1f63f0] transition-colors duration-200 hover:text-[#1857da]"
                          type="button"
                          onClick={() => {
                            link.onClick();
                          }}
                        >
                          {link.label}
                        </button>
                      ) : (
                        <a
                          key={link.label}
                          className="block text-[13px] font-medium text-[#1f63f0] transition-colors duration-200 hover:text-[#1857da]"
                          href={link.href}
                        >
                          {link.label}
                        </a>
                      ),
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
