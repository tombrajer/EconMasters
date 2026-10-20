import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { render } from '../.prerender/entry-server.js';

const template = await readFile('dist/index.html', 'utf8');
for (const path of ['/', '/register', '/team', '/privacy', '/admin']) {
  let html = template.replace('<!--app-html-->', render(path));
  if (path === '/register') {
    html = html.replace(/<title>.*?<\/title>/, '<title>Registration | Economics Masters Challenge</title>');
    html = html.replace(/<meta name="description" content="[^"]*"/, '<meta name="description" content="Register a team of three for the Economics Masters Challenge: a multiple-choice round and a case challenge presented to the judges."');
  }
  if (path === '/team') {
    html = html.replace(/<title>.*?<\/title>/, '<title>Team | Economics Masters Challenge</title>');
    html = html.replace(/<meta name="description" content="[^"]*"/, '<meta name="description" content="Meet the founders and the student organising team behind the Economics Masters Challenge."');
  }
  if (path === '/privacy') {
    html = html.replace(/<title>.*?<\/title>/, '<title>Privacy | Economics Masters Challenge</title>');
    html = html.replace(/<meta name="description" content="[^"]*"/, '<meta name="description" content="How the Economics Masters Challenge collects, uses and protects personal data under the GDPR."');
  }
  if (path === '/admin') {
    html = html.replace(/<title>.*?<\/title>/, '<title>Admin | Economics Masters Challenge</title>');
    html = html.replace(/<meta name="description" content="[^"]*"/, '<meta name="robots" content="noindex, nofollow"');
  }
  const directory = path === '/' ? 'dist' : `dist${path}`;
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}/index.html`, html);
  if (path === '/register' || path === '/team' || path === '/privacy') await writeFile(`dist${path}.html`, html);
}
console.log('Prerendered /, /register, /team, /privacy and /admin. The public pages remain readable without JavaScript.');
