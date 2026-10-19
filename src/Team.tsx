import { content, site } from './content';
import { Arrow, LinkedIn, Portrait } from './components/Shared';

export function Team() {
  return <main id="main" className="team-main">
    <section className="team-intro container" aria-labelledby="team-title">
      <h1 id="team-title">The team.</h1>
      <p>Economics Masters Challenge is organised entirely by high school students: three founders and the organising team that runs each edition with them.</p>
    </section>

    <section className="team-founders section container" aria-labelledby="founders-title">
      <h2 id="founders-title" className="team-label">Founders</h2>
      <div className="founders">{content.founders.map(founder => <article className="founder" key={founder.name}>
        <Portrait className="founder-portrait" name={founder.name} src={founder.src} />
        <div className="founder-body">
          <p className="person-role">{founder.role}</p>
          <div className="founder-name"><h3>{founder.name}</h3>{founder.linkedin && <LinkedIn name={founder.name} href={founder.linkedin} />}</div>
          <p className="founder-bio">{founder.bio.trim()}</p>
        </div>
      </article>)}</div>
    </section>

    <section className="team-organisers section container" aria-labelledby="organisers-title">
      <div className="split-heading"><h2 id="organisers-title">Organising team</h2><p>The students who plan the rounds, bring in judges and partners, and run competition day.</p></div>
      <ul className="team-grid">{content.team.map((member, index) => <li className="team-member" key={member.name || index}>
        <Portrait className="team-portrait" name={member.name} src={member.image || undefined} />
        <h3>{member.name || 'To be announced'}</h3>
        <p>{member.role}</p>
      </li>)}</ul>
    </section>

    <section className="container team-youth-voice"><div className="youth-voice"><p><strong>Youth Voice</strong> is a student-led platform making economics more accessible through writing, events, and academic initiatives.</p><a href={site.instagram} target="_blank" rel="noreferrer" className="text-link">Youth Voice on Instagram<Arrow diagonal /></a></div></section>
  </main>;
}
