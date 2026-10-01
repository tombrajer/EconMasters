import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { render } from '../.prerender/entry-server.js';

const template = await readFile('dist/index.html', 'utf8');
for (const path of ['/', '/register']) {
  let html = template.replace('<!--app-html-->', render(path));
  if (path === '/register') {
    html = html.replace(/<title>.*?<\/title>/, '<title>Registration | Economics Masters Challenge</title>');
    html = html.replace(/<meta name="description" content="[^"]*"/, '<meta name="description" content="Register a team of three for the Economics Masters Challenge: a multiple-choice round and a case challenge presented to the judges."');
  }
  const directory = path === '/' ? 'dist' : 'dist/register';
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}/index.html`, html);
  if (path === '/register') await writeFile('dist/register.html', html);
}
console.log('Prerendered / and /register. Both pages remain readable without JavaScript.');
