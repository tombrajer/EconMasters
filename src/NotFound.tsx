import { Arrow, RegisterLink } from './components/Shared';

export function NotFound() {
  return <main id="main" className="legal-main">
    <section className="team-intro container" aria-labelledby="not-found-title">
      <h1 id="not-found-title">Page not found.</h1>
      <div>
        <p>This page does not exist. The competition format, schedule and FAQ are on the home page.</p>
        <p className="not-found-actions"><a className="text-link" href="/">Home<Arrow /></a><RegisterLink label="Register your team" /></p>
      </div>
    </section>
  </main>;
}
