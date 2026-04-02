import { Features } from '../../components/public/Features';
import { FinalCta } from '../../components/public/FinalCta';
import { Hero } from '../../components/public/Hero';
import { HowItWorks } from '../../components/public/HowItWorks';
import { SectionBlock } from '../../components/public/SectionBlock';

export function LandingPage() {
  return (
    <div className="space-y-8 pb-4">
      <Hero />

      <SectionBlock
        description="Crypto users often collect addresses from exchanges, wallets, clients, and apps. That quickly becomes messy and difficult to track."
        eyebrow="Problem → Solution"
        title="Too many addresses. Not enough structure."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-rose-400/20 bg-rose-400/5 p-5">
            <h3 className="text-lg font-semibold text-white">The problem</h3>
            <ul className="mt-3 space-y-3 text-sm leading-7 text-slate-300">
              <li>Users manage multiple crypto addresses across tools and contexts.</li>
              <li>It becomes hard to track what belongs where and why it was saved.</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5">
            <h3 className="text-lg font-semibold text-white">The solution</h3>
            <ul className="mt-3 space-y-3 text-sm leading-7 text-slate-300">
              <li>EZ-CRYPT0 centralizes your addresses into one structured workspace.</li>
              <li>It pairs with a browser extension so capture and management stay connected.</li>
            </ul>
          </article>
        </div>
      </SectionBlock>

      <SectionBlock
        description="A simple flow built for people who want less friction and more clarity."
        eyebrow="How it works"
        title="From browser activity to organized dashboard"
      >
        <HowItWorks />
      </SectionBlock>

      <SectionBlock
        description="Everything is designed to help you stay organized without adding extra complexity."
        eyebrow="Features"
        title="Core capabilities for modern crypto workflows"
      >
        <Features />
      </SectionBlock>

      <FinalCta />
    </div>
  );
}
