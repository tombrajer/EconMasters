import { useRef } from 'react';
import { useScrollMotion } from './useScrollMotion';
import { content, edition, eligibility, partners, preparation, site } from './content';
import { Arrow, Disclosure, RegisterLink } from './components/Shared';
import { ExampleQuestion, Timeline } from './components/Graphs';
import { EconomicPlate, MarketLandscape } from './components/MarketLandscape';

const [foundations, caseRound] = content.rounds;

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
      <div className="container">
        <ol className="hero-rounds" aria-label="Competition rounds">
          <li><span>Round 1</span><strong>Multiple-choice exam</strong><p>An MCQ exam on microeconomics and macroeconomics.</p></li>
          <li><span>Round 2</span><strong>Case challenge</strong><p>Solve a real-world case as a team, then present your solution to the judges.</p></li>
        </ol>
      </div>
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
          <ol className="case-steps">{caseRound.steps?.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span>{step}</li>)}</ol>
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

    <section className="judges-section section" id="judges" aria-labelledby="judges-title"><div className="container">
      <div className="split-heading"><h2 id="judges-title">2026 judges</h2><p>The panel for the next edition will be announced.</p></div>
      <div className="judges">{content.judges.map(judge => <article className="judge" key={judge.name}>
        {judge.image ? <img src={judge.image} alt={judge.name} width="400" height="480" loading="lazy" /> : <div className="portrait-placeholder" role="img" aria-label={`Portrait unavailable for ${judge.name}`}><span>{judge.name.split(' ').map(part => part[0]).join('')}</span></div>}
        <h3>{judge.name}</h3><p>{judge.background}</p>
      </article>)}</div>
    </div></section>

    <section className="partners-section section" id="partners" aria-labelledby="partners-title"><div className="container">
      <h2 id="partners-title">2026 partners</h2>
      <ul className="partner-logos">{partners.map(partner => <li key={partner.name}><a href={partner.href} target="_blank" rel="noreferrer" aria-label={partner.name}><img className={`logo-${partner.width / partner.height > 2 ? 'wide' : 'round'}`} src={partner.logo} alt={partner.name} width={partner.width} height={partner.height} loading="lazy" /></a></li>)}</ul>
    </div></section>

    <section className="founders-section section" id="founders" aria-labelledby="founders-title"><div className="container">
      <h2 id="founders-title">Organisers</h2>
      <div className="founders">{content.founders.map(founder => <article className="founder" key={founder.name}>
        <img src={founder.src} alt={founder.name} width="600" height="720" loading="lazy" />
        <div className="founder-body">
          <div className="founder-name"><h3>{founder.name}</h3>{founder.linkedin && <a href={founder.linkedin} target="_blank" rel="noreferrer" aria-label={`${founder.name} on LinkedIn`}><Arrow diagonal /></a>}</div>
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
