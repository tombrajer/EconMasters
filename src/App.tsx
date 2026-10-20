import { Header, Footer } from './components/Shared';
import { Home } from './Home';
import { Register } from './Register';
import { Admin } from './Admin';
import { Team } from './Team';
import { Privacy } from './Privacy';

export function App({ path }: { path: string }) {
  const route = path.replace(/\/$/, '').replace(/\.html$/, '');
  const page = route === '/register' ? <Register /> : route === '/admin' ? <Admin /> : route === '/team' ? <Team /> : route === '/privacy' ? <Privacy /> : <Home />;
  return <><Header overHero={!['/register', '/admin', '/team', '/privacy'].includes(route)} />{page}<Footer /></>;
}
