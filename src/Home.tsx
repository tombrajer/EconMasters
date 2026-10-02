import { useRef } from 'react';
import { useScrollMotion } from './useScrollMotion';
import { content, edition, eligibility, partners, preparation, site } from './content';
import { Arrow, Disclosure, RegisterLink } from './components/Shared';
import { ExampleQuestion, Timeline } from './components/Graphs';
import { EconomicPlate, MarketLandscape } from './components/MarketLandscape';

const [foundations, caseRound] = content.rounds;
const caseIcons = [
  <><path d="M8 3h13l5 5v25H8Z" /><path d="M21 3v6h5M12 14h10M12 19h10M12 24h7" /></>,
  <><path d="M5 24h5v9H5ZM15 16h5v17h-5ZM25 6h5v27h-5Z" /></>,
  <><path d="M12 24c0-4-5-5-5-12a10 10 0 0 1 20 0c0 7-5 8-5 12M12 24h10M13 28h8M15 32h4" /></>,
  <><circle cx="12" cy="10" r="5" /><path d="M3 30v-3c0-5 4-8 9-8s9 3 9 8v3ZM24 6a5 5 0 0 1 0 10M25 20c5 0 8 3 8 7v3h-8" /></>,
];

export function Home() {
  const main = useRef<HTMLElement>(null);
  useScrollMotion(main);
  return <main id="main" ref={main}>
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-top container">
        <h1 id="hero-title">Economics<br /><span>Masters Challenge.</span></h1>
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
          <header className="round-head"><span className="round-index">Round {foundations.index}</span><span className="round-type">MCQ exam</span></header>
          <h3>{foundations.title}</h3>
          <p className="round-lead">{foundations.lead}</p>
          <dl className="round-facts">{foundations.facts?.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
          <ExampleQuestion />
          <p className="round-note">Figures from the 2026 edition. The format may vary by edition.</p>
        </article>
        <article className="round round-case">
          <header className="round-head"><span className="round-index">Round {caseRound.index}</span><span className="round-type">{caseRound.type}</span></header>
          <h3>{caseRound.title}</h3>
          <p className="round-lead">{caseRound.lead}</p>
          <ol className="case-steps">{caseRound.steps?.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span><svg className="case-step-icon" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{caseIcons[index]}</svg><p>{step}</p></li>)}</ol>
          <figure className="case-photo"><img src="/photos/team-presentations.jpg" alt="A team presenting its case solution to the judges at the 2026 edition" width="1200" height="800" loading="lazy" /><figcaption>Team presentations, 2026</figcaption></figure>
          <div className="case-criteria"><p>The judges score</p><ul>{caseRound.points.map(point => <li key={point}>{point}</li>)}</ul></div>
        </article>
      </div>
    </div></section>

    <section className="day-section section" id="day" aria-labelledby="day-title"><div className="container">
      <div className="split-heading"><h2 id="day-title">Competition day</h2><p>2026 schedule. Next edition to be announced.</p></div>
      <Timeline />
    </div></section>

    <section className="prepare-section section" id="prepare" aria-labelledby="prepare-title"><div className="container">
      <h2 id="prepare-title">What to prepare</h2>
    </div>
      <div className="economic-rows">
        {preparation.map(row => <article className="economic-row container" key={row.title}>
          <div className="economic-row-title"><span className="model-label">{row.round} · {row.meta}</span><h3>{row.title}</h3></div>
          <EconomicPlate kind={row.kind} />
          <ul className="topic-list">{row.topics.map(topic => <li key={topic}>{topic}</li>)}</ul>
        </article>)}
      </div>
    </section>

    <section className="eligibility-section section" id="eligibility" aria-labelledby="eligibility-title"><div className="container eligibility-layout">
      <div><h2 id="eligibility-title">Who can enter</h2><p>Any high school student, from any grade and any academic program. Eligibility is confirmed for each edition.</p><RegisterLink label="Register your team" /></div>
      <dl className="facts-list">{eligibility.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    </div></section>

    <section className="edition-section section" id="previous-edition" aria-labelledby="edition-title"><div className="container">
      <h2 id="edition-title">The 2026 edition</h2>
      <dl className="edition-facts">{edition.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <div className="gallery">{content.gallery.map(photo => <figure key={photo.src}><div className="photo-window"><img src={photo.src} alt={photo.caption} width="1200" height="800" loading="lazy" /></div><figcaption>{photo.caption}</figcaption></figure>)}</div>
    </div></section>

    <section className="judges-section section container" id="judges" aria-labelledby="judges-title"><div className="judges-heading"><h2 id="judges-title">Judges <em>& experts.</em></h2><p>2026 edition</p><p className="judges-description">Next-edition panel to be confirmed.</p></div><div className="judges">{content.judges.map(judge => <article className="judge" key={judge.name}>{judge.image ? <img src={judge.image} alt={judge.name} width="120" height="144" loading="lazy" /> : <div className="portrait-placeholder" role="img" aria-label={`Portrait unavailable for ${judge.name}`}><span>DW</span></div>}<div><h3>{judge.name}</h3><p>{judge.background}</p></div></article>)}</div></section>

    <section className="partners-section section" id="partners" aria-labelledby="partners-title"><div className="container">
      <h2 id="partners-title">2026 partners</h2>
      <ul className="partner-logos">{partners.map(partner => <li key={partner.name}><a href={partner.href} target="_blank" rel="noreferrer" aria-label={partner.name}><img className={`logo-${partner.width / partner.height > 2 ? 'wide' : 'round'}`} src={partner.logo} alt={partner.name} width={partner.width} height={partner.height} loading="lazy" /></a></li>)}</ul>
    </div></section>

    <section className="founders-section section" id="founders" aria-labelledby="founders-title"><div className="container">
      <h2 id="founders-title">Organisers</h2>
      <div className="founders">{content.founders.map(founder => <article className="founder" key={founder.name}>
        <img src={founder.src} alt={founder.name} width="600" height="720" loading="lazy" />
        <div className="founder-body">
          <div className="founder-name"><h3>{founder.name}</h3>{founder.linkedin && <a href={founder.linkedin} target="_blank" rel="noreferrer" className="founder-linkedin" aria-label={`${founder.name} on LinkedIn`}><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.75H4.98V9.2h2.95v9.55ZM6.46 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42ZM19 18.75h-2.95V14.1c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.76V9.2h2.83v1.3h.04c.39-.74 1.36-1.52 2.79-1.52 2.99 0 3.58 1.97 3.58 4.53v5.24Z" /></svg></a>}</div>
          <p className="person-role">Founder</p>
          <Disclosure label="Read bio"><p className="founder-bio">{founder.bio}</p></Disclosure>
        </div>
      </article>)}</div>
      <div className="youth-voice"><p><strong>Youth Voice</strong> is a student-led platform making economics more accessible through writing, events, and academic initiatives.</p><a href={site.instagram} target="_blank" rel="noreferrer" className="text-link">Youth Voice on Instagram<Arrow diagonal /></a></div>
    </div></section>

    <section className="faq-section section" id="faq" aria-labelledby="faq-title"><div className="container faq-layout">
      <div><h2 id="faq-title">FAQ</h2><p>Anything else? <a className="text-link" href={`mailto:${site.email}`}>{site.email}</a></p></div>
      <div className="faq-list">{content.faq.map(item => <Disclosure key={item.q} label={item.q}><p>{item.a}</p></Disclosure>)}</div>
    </div></section>

    <section className="closing-section section" aria-labelledby="closing-title"><div className="container closing-layout">
      <div><h2 id="closing-title">Register your team</h2><p className="registration-status">Dates for the next edition and registration will be announced.</p></div>
      <div className="closing-actions"><RegisterLink label="Go to registration" /><a className="text-link" href={`mailto:${site.email}`}>Contact us<Arrow diagonal /></a></div>
    </div></section>
  </main>;
}
