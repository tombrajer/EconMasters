import { Header, Footer } from './components/Shared';
import { Home } from './Home';
import { Register } from './Register';

export function App({ path }: { path: string }) {
  const registration = path.replace(/\/$/, '').replace(/\.html$/, '') === '/register';
  return <><Header />{registration ? <Register /> : <Home />}<Footer /></>;
}
