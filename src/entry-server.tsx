import { renderToString } from 'react-dom/server';
import { App } from './App';

export { head, indexedRoutes, llms, robots, sitemap } from './seo';
export function render(path: string) { return renderToString(<App path={path} />); }
