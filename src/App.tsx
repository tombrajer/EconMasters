import { Header, Footer } from './components/Shared';
import { Home } from './Home';
import { Register } from './Register';
import { Admin } from './Admin';
import { Team } from './Team';
import { Privacy } from './Privacy';
import { NotFound } from './NotFound';
import { routeFor, type Route } from './seo';
import type { ComponentType } from 'react';

const views: Record<Route, ComponentType> = { '/': Home, '/register': Register, '/admin': Admin, '/team': Team, '/privacy': Privacy, '/404': NotFound };

export function App({ path }: { path: string }) {
  const route = routeFor(path);
  const Page = views[route];
  return <><Header overHero={route === '/'} /><Page /><Footer /></>;
}
