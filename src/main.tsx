import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';
import { pages, routeFor } from './seo';
import './styles.css';

const root = document.getElementById('root')!;
const app = <App path={window.location.pathname} />;
if (root.querySelector('header')) hydrateRoot(root, app);
else createRoot(root).render(app);
document.title = pages[routeFor(window.location.pathname)].title;
