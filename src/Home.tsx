import { useEffect, useRef, useState } from 'react';
import { DotPattern } from '@/components/ui/dot-pattern';
import TiltCascadeDemo from '@/components/ui/tilt-cascade-demo';
import { useScrollMotion } from './useScrollMotion';
import { useReveal } from './useReveal';
import { content, edition, eligibility, partners, preparation, previousPartners, site, upcomingEdition, type Partner } from './content';
import { Arrow, Disclosure, Portrait, RegisterLink } from './components/Shared';
import { ExampleQuestion, Timeline } from './components/Graphs';
import { EconomicPlate, MarketLandscape } from './components/MarketLandscape';
import './components/content.css';

const [foundations, caseRound] = content.rounds;
const caseIcons = [
  <><path d="M8 3h13l5 5v25H8Z" /><path d="M21 3v6h5M12 14h10M12 19h10M12 24h7" /></>,
  <><path d="M5 24h5v9H5ZM15 16h5v17h-5ZM25 6h5v27h-5Z" /></>,
  <><path d="M12 24c0-4-5-5-5-12a10 10 0 0 1 20 0c0 7-5 8-5 12M12 24h10M13 28h8M15 32h4" /></>,
  <><circle cx="12" cy="10" r="5" /><path d="M3 30v-3c0-5 4-8 9-8s9 3 9 8v3ZM24 6a5 5 0 0 1 0 10M25 20c5 0 8 3 8 7v3h-8" /></>,
];

type Judge = { name: string; background: string; image: string };

// Keep the outer markup exactly `<article class="judge">`: the routes test strips these blocks.
function JudgeCard({ judge }: { judge: Judge }) {
  return <article className="judge"><Portrait className="judge-portrait" name={judge.name} src={judge.image || undefined} size={240} /><div className="judge-body" data-pending={judge.name ? undefined : 'true'}><h3>{judge.name || 'To be announced'}</h3><p>{judge.background || 'Judge & expert'}</p></div></article>;
}

// Section headings and the organisers teaser fade in once; never the hero or registration.
const revealTargets = 'main > section:not(.hero) h2:not(.team-teaser h2), .team-teaser';

function PartnerLogos({ list }: { list: Partner[] }) {
  return <ul className="partner-logos">{list.map(partner => <li key={partner.name}><a href={partner.href} target="_blank" rel="noreferrer" aria-label={partner.name}><img className={`logo-${partner.width / partner.height > 2 ? 'wide' : 'round'}`} src={partner.logo} alt={partner.name} width={partner.width} height={partner.height} loading="lazy" /></a></li>)}</ul>;
}

export function Home() {
  const main = useRef<HTMLElement>(null);
  const [background, setBackground] = useState('dots');
  useEffect(() => {
    setBackground(new URLSearchParams(window.location.search).get('background') === 'wave' ? 'wave' : 'dots');
  }, []);
  useScrollMotion(main);
  useReveal(revealTargets);
  return <main id="main" ref={main}>
    <section className="hero" aria-labelledby="hero-title" data-background={background}>
      {background === 'dots' && <DotPattern width={20} height={20} cr={.85} className="fill-[#0a2448]/15 [mask-image:radial-gradient(ellipse_at_center,white,transparent_85%)]" />}
      <div className="hero-top container">
        <h1 id="hero-title">Economics<br /><span>Masters Challenge</span></h1>
        <ul className="hero-event-details" aria-label="Event details">
          <li>Date: TBD</li>
          <li>In-Person Event</li>
          <li>{site.host}</li>
        </ul>
        <div className="hero-copy">
          <p className="hero-description">A student-run economics competition for high school teams of three.</p>
          <div className="hero-actions"><RegisterLink label="Register your team" /><a className="text-link" href="#format">How it works<Arrow /></a></div>
        </div>
      </div>
      <MarketLandscape />
    </section>

    <section id="format" className="format-section section" aria-labelledby="format-title"><div className="container">
      <h2 id="format-title">The format</h2>
      <div className="rounds">
        <article className="round">
          <header className="round-head"><span className="round-index">Round {foundations.index}</span></header>
          <h3>{foundations.title}</h3>
          <p className="round-lead">{foundations.lead}</p>
          <dl className="round-facts">{foundations.facts?.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
          <ExampleQuestion />
        </article>
        <article className="round round-case">
          <header className="round-head"><span className="round-index">Round {caseRound.index}</span></header>
          <h3>{caseRound.title}</h3>
          <p className="round-lead">{caseRound.lead}</p>
          <ol className="case-steps">{caseRound.steps?.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span><svg className="case-step-icon" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{caseIcons[index]}</svg><p>{step}</p></li>)}</ol>
          <figure className="case-photo"><img src="/photos/team-presentations.jpg" alt="A team presenting its case solution to the judges at the 2026 edition" width="1200" height="800" loading="lazy" /></figure>
          <div className="case-criteria"><p>The judges score</p><ul>{caseRound.points.map(point => <li key={point}>{point}</li>)}</ul></div>
        </article>
      </div>
    </div></section>

    <section className="day-section section" id="day" aria-labelledby="day-title"><div className="container">
      <div className="day-layout">
        <div className="day-intro"><h2 id="day-title">Competition day schedule</h2></div>
        <Timeline />
      </div>
    </div></section>

    <section className="prepare-section section" id="prepare" aria-labelledby="prepare-title"><div className="container">
      <h2 id="prepare-title">What to prepare</h2>
    </div>
      <div className="economic-rows">
        {preparation.map(row => <article className="economic-row container" key={row.title}>
          <div className="economic-row-title"><span className="model-label">{row.round}</span><h3>{row.title}</h3></div>
          <EconomicPlate kind={row.kind} />
          <ul className="topic-list">{row.topics.map(topic => <li key={topic}>{topic}</li>)}</ul>
        </article>)}
      </div>
    </section>

    <section className="eligibility-section section" id="eligibility" aria-labelledby="eligibility-title"><div className="container eligibility-layout">
      <h2 id="eligibility-title">Who can enter</h2>
      <div><dl className="facts-list">{eligibility.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><RegisterLink label="Register your team" /></div>
    </div></section>

    <section className="edition-section section" id="previous-edition" aria-labelledby="edition-title"><div className="container">
      <h2 id="edition-title">The 2026 edition</h2>
      <dl className="edition-facts">{edition.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <div className="gallery-carousel"><TiltCascadeDemo /></div>
    </div></section>

    <section className="judges-section section container" id="judges" aria-labelledby="judges-title"><div className="judges-heading"><h2 id="judges-title">Judges <em>& experts.</em></h2><p>{upcomingEdition} edition</p></div>
      <div className="judges">{content.judges.map((judge, index) => <JudgeCard key={judge.name || index} judge={judge} />)}</div>
      {content.previousJudges.map(past => <Disclosure key={past.edition} className="archive" label={`Previous judges · ${past.edition} edition`}><div className="judges">{past.judges.map(judge => <JudgeCard key={judge.name} judge={judge} />)}</div></Disclosure>)}
    </section>

    <section className="partners-section section" id="partners" aria-labelledby="partners-title"><div className="container">
      <h2 id="partners-title">{upcomingEdition} partners</h2>
      {partners.length ? <PartnerLogos list={partners} /> : <div className="partners-empty"><p>Partners for the {upcomingEdition} edition will be announced.</p><a className="text-link" href={`mailto:${site.email}?subject=Partnering%20with%20Economics%20Masters%20Challenge`}>Become a partner<Arrow diagonal /></a></div>}
      {previousPartners.map(past => <Disclosure key={past.edition} className="archive" label={`Previous sponsors · ${past.edition} edition`}><PartnerLogos list={past.partners} /></Disclosure>)}
    </div></section>

    <section className="founders-section section" id="organisers" aria-labelledby="organisers-title"><div className="container team-teaser">
      <ul className="avatar-stack" aria-hidden="true">{content.founders.map(founder => <li key={founder.name}><Portrait name={founder.name} src={founder.src} size={240} /></li>)}</ul>
      <div><h2 id="organisers-title">Organisers</h2><p>Organised entirely by high school students.</p></div>
      <a className="button" href="/team">Meet the team<Arrow /></a>
    </div></section>

    <section className="faq-section section" id="faq" aria-labelledby="faq-title"><div className="container faq-layout">
      <div><h2 id="faq-title">FAQ</h2><p>Anything else? <a className="text-link" href={`mailto:${site.email}`}>{site.email}</a></p></div>
      <div className="faq-list">{content.faq.map(item => <Disclosure key={item.q} label={item.q}><p>{item.a}</p></Disclosure>)}</div>
    </div></section>

    <section className="closing-section section" aria-labelledby="closing-title"><div className="container closing-layout">
      <h2 id="closing-title">Register your team</h2>
      <div className="closing-actions"><RegisterLink label="Go to registration" /><a className="text-link" href={`mailto:${site.email}`}>Contact us<Arrow diagonal /></a></div>
    </div></section>
  </main>;
}
