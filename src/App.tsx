import { Header, Footer } from './components/Shared';
import { Home } from './Home';
import { Register } from './Register';
import { Admin } from './Admin';

export function App({ path }: { path: string }) {
  const route = path.replace(/\/$/, '').replace(/\.html$/, '');
  return <><Header />{route === '/register' ? <Register /> : route === '/admin' ? <Admin /> : <Home />}<Footer /></>;
}
