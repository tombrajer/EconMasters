import { site } from './content';
import './components/content.css';

const email = <a href={`mailto:${site.email}`}>{site.email}</a>;

export function Privacy() {
  return <main id="main" className="legal-main">
    <section className="team-intro container" aria-labelledby="privacy-title">
      <h1 id="privacy-title">Privacy.</h1>
      <p>How the Economics Masters Challenge handles personal data under the EU General Data Protection Regulation (GDPR). Last updated 20 October 2026.</p>
    </section>

    <div className="container"><div className="legal-body">
      <section aria-labelledby="privacy-controller">
        <h2 id="privacy-controller">Who is responsible</h2>
        <p>The Economics Masters Challenge is organised by Youth Voice, a student initiative. Youth Voice is the controller of the personal data described here. For anything about your data, email {email}.</p>
      </section>

      <section aria-labelledby="privacy-collect">
        <h2 id="privacy-collect">What we collect and why</h2>
        <h3>Team registration</h3>
        <p>The team name, school, the names of the three team members, the captain's name and an email address. You can also give a phone number, academic program, grade, country, how you heard about us and notes. We use this only to run the competition: to confirm your place, contact your team, organise the competition day and announce results.</p>
        <p>Legal basis: taking the steps you ask for when you register (Art. 6(1)(b) GDPR) and our legitimate interest in organising the competition (Art. 6(1)(f)). The optional fields are voluntary.</p>
        <h3>Photos and results</h3>
        <p>We take photos on competition day and may publish them, along with the winning teams and their schools, on this website and our Instagram. Tell us on the day or by email if you do not want to appear, and we will remove published photos of you.</p>
        <h3>Website visits</h3>
        <p>Our hosting provider processes your IP address and basic browser information in short-lived server logs, which is needed to deliver and protect the site (Art. 6(1)(f)).</p>
      </section>

      <section aria-labelledby="privacy-cookies">
        <h2 id="privacy-cookies">Cookies</h2>
        <p>This website uses no cookies, analytics or tracking. Fonts and images load from our own domain. Links to Instagram, LinkedIn and partner websites take you to services with their own privacy policies.</p>
      </section>

      <section aria-labelledby="privacy-sharing">
        <h2 id="privacy-sharing">Who receives your data</h2>
        <p>Only the organising team members who need it. We do not sell your data or pass it to partners or sponsors.</p>
        <p>We use two processors: Vercel Inc. hosts the website and Neon stores registrations. Some of their processing may take place in the United States, protected by the EU–US Data Privacy Framework or the European Commission's standard contractual clauses.</p>
      </section>

      <section aria-labelledby="privacy-retention">
        <h2 id="privacy-retention">How long we keep it</h2>
        <p>Registration details are deleted no later than 12 months after the competition day of that edition. Published photos and results stay online until you ask us to remove them.</p>
      </section>

      <section aria-labelledby="privacy-minors">
        <h2 id="privacy-minors">Students under 18</h2>
        <p>Most participants are high school students. The captain registers the whole team and confirms that their teammates know their details are being shared with us. Parents and guardians can contact us at any time to see or remove a student's data.</p>
      </section>

      <section aria-labelledby="privacy-rights">
        <h2 id="privacy-rights">Your rights</h2>
        <p>You can ask to see, correct or delete your data, to restrict or object to how we use it, and to receive it in a portable format. Email {email} and we will reply within one month.</p>
        <p>You can also complain to a data protection authority: in the Czech Republic, the Office for Personal Data Protection (<a href="https://uoou.gov.cz/en" target="_blank" rel="noreferrer">uoou.gov.cz</a>), or the authority in the EU country where you live.</p>
      </section>
    </div></div>
  </main>;
}
