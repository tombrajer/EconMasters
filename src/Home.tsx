import { useRef } from 'react';
import { useScrollMotion } from './useScrollMotion';
import { academicRows, content, eligibility, partners, schedule, site } from './content';
import { Arrow, Disclosure, RegisterLink } from './components/Shared';
import { Journey, SmallGraph } from './components/Graphs';
import { EconomicPlate, MarketLandscape } from './components/MarketLandscape';

export function Home() {
  const main = useRef<HTMLElement>(null);
  useScrollMotion(main);
  return <main id="main" ref={main}>
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-top container"><h1 id="hero-title">Economics<br /><span>Masters Challenge.</span></h1><div className="hero-copy"><p className="hero-description">A two-round economics competition for high school teams. Real questions. Original thinking.</p><div className="hero-actions"><a className="text-link" href="#competition">Explore the format<Arrow /></a><RegisterLink label="Build your team" /></div></div></div>
      <MarketLandscape />

    </section>

    <section id="about" className="about-section section container">
      <p>A student-led challenge. Analyze data, apply theory, and solve real-world problems. Inspired by AP-style rigor, open to different academic programs.</p>
    </section>

    <section id="competition" className="format-section section"><div className="container">
      <div className="section-heading"><h2>Two rounds.<br /><em>One team.</em></h2></div>
      <div className="rounds">{content.rounds.map((round, index) => <article className="round" key={round.index}><div className="round-top"><span className="round-number">Round {round.index}</span><SmallGraph kind={index === 0 ? 'foundations' : 'case'} /></div><h3>{round.title}</h3><p className="round-lead">{round.lead}</p><Disclosure className="round-extra" label="Topics & scoring"><ul className="round-topics">{round.points.map(point => <li key={point}>{point}</li>)}</ul><p className="round-note">{round.note}</p></Disclosure></article>)}<article className="round team-round"><div className="round-top"><span className="round-number">The team</span><SmallGraph kind="frontier" /></div><h3>Three perspectives</h3><p className="round-lead">Three students. One shared solution. Work together throughout both rounds.</p><a className="text-link" href="#eligibility">Who can join<Arrow /></a></article></div>
      <p className="format-note">Teams of three compete together throughout both rounds.</p>
    </div></section>

    <section className="how-section section container" id="how-it-works"><div className="how-intro"><h2>Follow{' '}<br />your <em>thinking.</em></h2><a href="#eligibility" className="text-link">Find your starting point<Arrow /></a></div><Journey /></section>

    <section className="philosophy-section" aria-label="Academic philosophy and benefits"><div className="economic-rows">
      {academicRows.map(row => <article className="economic-row container" key={row.kind}><div className="economic-row-title"><span className="model-label">{row.label}</span><h3>{row.title}</h3></div><EconomicPlate kind={row.kind} /><p>{row.body}</p></article>)}
    </div></section>

    <section className="eligibility-section section container" id="eligibility"><div><h2>A place for<br /><em>curious minds.</em></h2><p className="eligibility-description">All high school grades. AP, IB, and other programs. Eligibility is confirmed for each edition.</p></div><dl className="facts-list">{eligibility.map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>

    <section className="founders-section section" id="founders"><div className="container"><div className="section-heading"><h2>Organizers</h2></div><div className="founders">{content.founders.map(founder => <article className="founder" key={founder.name}><img src={founder.src} alt={founder.name} width="600" height="720" loading="lazy" /><div className="founder-name"><h3>{founder.name}</h3>{founder.linkedin && <a href={founder.linkedin} target="_blank" rel="noreferrer" aria-label={`${founder.name} on LinkedIn`}><Arrow diagonal /></a>}</div><p className="person-role">Founder</p><Disclosure label={`Meet ${founder.name.split(" ")[0]}`}><p className="founder-bio">{founder.bio}</p></Disclosure></article>)}</div></div></section>

    <section className="judges-section section container" id="judges"><div className="judges-heading"><h2>Judges <em>& experts.</em></h2><p>2026 edition</p><p className="judges-description">Next-edition panel to be confirmed.</p></div><div className="judges">{content.judges.map(judge => <article className="judge" key={judge.name}>{judge.image ? <img src={judge.image} alt={judge.name} width="120" height="144" loading="lazy" /> : <div className="portrait-placeholder" aria-label={`Portrait unavailable for ${judge.name}`}><span>DW</span></div>}<div><h3>{judge.name}</h3><p>{judge.background}</p></div></article>)}</div></section>

    <section className="partners-section container" id="partners"><div className="partners-heading"><h2>In good company.</h2><p>Partners & sponsors · 2026 edition</p></div><div className="partner-wordmarks">{partners.map(partner => <a className={`partner-${partner.name.toLowerCase()}`} href={partner.href} key={partner.name} target="_blank" rel="noreferrer">{partner.name}<Arrow diagonal /></a>)}</div><p className="partners-note">Selected 2026 partners. Future partnerships to be announced.</p></section>

    <section className="previous-section section" id="previous-edition"><div className="container"><div className="section-heading"><h2>The first<br /><em>chapter.</em></h2><div><p className="edition-date">May 29, 2026</p><p>Approximately 40 students. Two rounds. One real-world case.<br />Hosted at {site.host}.</p></div></div><div className="edition-strip"><span>2026 edition</span><p>3 students per team</p><p>2 competition rounds</p><p>1 real-world case</p></div><div className="gallery">{content.gallery.map((photo,index) => <figure key={photo.src}><div className="photo-window"><img src={photo.src} alt={photo.caption} width="1200" height="800" loading="lazy" /></div><figcaption><span>{String(index+1).padStart(2,'0')}</span>{photo.caption}</figcaption></figure>)}</div><Disclosure className="edition-schedule" label="2026 edition schedule"><p>Indicative running order. Each edition publishes its own schedule.</p><ol>{schedule.map(([time,title],index) => <li key={index}><span>{time}</span>{title}</li>)}</ol></Disclosure></div></section>

    <section className="youth-section section container" id="youth-voice"><h2>A new generation.<br /><em>A voice of its own.</em></h2><div><p>Born from Youth Voice, a student-led platform making economics more accessible through writing, events, and academic initiatives.</p><a href={site.instagram} target="_blank" rel="noreferrer" className="text-link">Explore Youth Voice<Arrow diagonal /></a></div></section>

    <section className="faq-section section" id="faq"><div className="container faq-layout"><div><h2>Questions,<br /><em>answered.</em></h2><p>Still curious?<br /><a className="text-link" href={`mailto:${site.email}`}>Let’s talk<Arrow diagonal /></a></p></div><div className="faq-list">{content.faq.map(item => <Disclosure key={item.q} label={item.q}><p>{item.a}</p></Disclosure>)}</div></div></section>

    <section className="closing-section section container"><div><h2>Bring your<br /><em>next big idea.</em></h2><div className="closing-actions"><RegisterLink label="Register your team" /><a className="text-link" href={`mailto:${site.email}`}>Contact us<Arrow diagonal /></a></div><p className="registration-status">Next edition and registration dates to be announced.</p></div><svg className="closing-graph" viewBox="0 0 400 300" fill="none" aria-hidden="true"><path className="graph-axis" d="M30 20v250h340"/><path className="graph-supply" d="M55 243c55-4 47-89 112-82s77-84 111-71 36-53 71-62"/><circle cx="349" cy="28" r="6" fill="currentColor"/></svg></section>
  </main>;
}
