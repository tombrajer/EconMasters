import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { head, indexedRoutes, llms, render, robots, sitemap } from '../.prerender/entry-server.js';

const template = await readFile('dist/index.html', 'utf8');
const page = path => template.replace('<!--app-head-->', head(path)).replace('<!--app-html-->', render(path));

for (const path of [...indexedRoutes, '/admin']) {
  const html = page(path);
  const directory = path === '/' ? 'dist' : `dist${path}`;
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}/index.html`, html);
  if (path !== '/') await writeFile(`dist${path}.html`, html);
}
// Vercel serves 404.html with a real 404 status for any unknown path.
await writeFile('dist/404.html', page('/404'));
await writeFile('dist/sitemap.xml', sitemap());
await writeFile('dist/robots.txt', robots());
await writeFile('dist/llms.txt', llms());
console.log(`Prerendered ${[...indexedRoutes, '/admin', '/404'].join(', ')}; wrote sitemap.xml, robots.txt and llms.txt.`);
