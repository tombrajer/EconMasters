import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

const root = document.getElementById('root')!;
const app = <App path={window.location.pathname} />;
if (root.querySelector('header')) hydrateRoot(root, app);
else createRoot(root).render(app);
if (window.location.pathname.startsWith('/register')) document.title = 'Registration | Economics Masters Challenge';
