import { Header, Footer } from './components/Shared';
import { Home } from './Home';
import { Register } from './Register';
import { Admin } from './Admin';
import { Team } from './Team';

export function App({ path }: { path: string }) {
  const route = path.replace(/\/$/, '').replace(/\.html$/, '');
  const page = route === '/register' ? <Register /> : route === '/admin' ? <Admin /> : route === '/team' ? <Team /> : <Home />;
  return <><Header overHero={route !== '/register' && route !== '/admin' && route !== '/team'} />{page}<Footer /></>;
}
