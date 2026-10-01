import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { render } from '../.prerender/entry-server.js';

const template = await readFile('dist/index.html', 'utf8');
for (const path of ['/', '/register']) {
  let html = template.replace('<!--app-html-->', render(path));
  if (path === '/register') {
    html = html.replace(/<title>.*?<\/title>/, '<title>Registration Preview | Economics Masters Challenge</title>');
    html = html.replace(/<meta name="description" content="[^"]*"/, '<meta name="description" content="Explore the Economics Masters Challenge team registration form. Preview only; no details are sent or saved."');
  }
  const directory = path === '/' ? 'dist' : 'dist/register';
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}/index.html`, html);
  if (path === '/register') await writeFile('dist/register.html', html);
}
console.log('Prerendered / and /register. Both pages remain readable without JavaScript.');
