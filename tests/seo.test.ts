import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const origin = 'https://www.econmasterschallenge.com';
const read = (file: string) => readFile(new URL(`../dist/${file}`, import.meta.url), 'utf8');
const pages = { '/': 'index.html', '/register': 'register/index.html', '/team': 'team/index.html', '/privacy': 'privacy/index.html' };
const graph = (html: string) => {
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
  assert.equal(scripts.length, 1, 'one JSON-LD block per page');
  return JSON.parse(scripts[0][1])['@graph'] as Record<string, unknown>[];
};

test('every public page has its own title, description, canonical and social card on the production domain', async () => {
  const titles = new Set<string>();
  for (const [path, file] of Object.entries(pages)) {
    const html = await read(file);
    const url = `${origin}${path}`;
    assert.equal(html.match(/<title>/g)?.length, 1);
    titles.add(html.match(/<title>(.*?)<\/title>/)![1]);
    assert.match(html, /<meta name="description" content="[^"]{50,160}"/);
    assert.ok(html.includes(`<link rel="canonical" href="${url}" />`), `${path} canonical`);
    assert.ok(html.includes(`<meta property="og:url" content="${url}" />`), `${path} og:url`);
    assert.match(html, /<meta name="robots" content="index, follow, max-image-preview:large/);
    assert.doesNotMatch(html, /econmasters\.vercel\.app/);
  }
  assert.equal(titles.size, Object.keys(pages).length, 'titles are unique');
});

test('structured data describes the organisation, the competition and the FAQ shown on the page', async () => {
  const home = await read('index.html');
  const nodes = graph(home);
  const types = nodes.map(node => node['@type']);
  for (const type of ['WebSite', 'Organization', 'WebPage', 'EventSeries', 'EducationEvent', 'FAQPage']) assert.ok(types.includes(type), type);
  const faq = nodes.find(node => node['@type'] === 'FAQPage') as { mainEntity: { name: string }[] };
  for (const question of faq.mainEntity) assert.ok(home.includes(question.name.replace(/'/g, '&#x27;')), `FAQ "${question.name}" is visible`);
  const ids = new Set(nodes.map(node => node['@id']));
  for (const ref of JSON.stringify(nodes).matchAll(/\{"@id":"([^"]+)"\}/g)) assert.ok(ids.has(ref[1]), `${ref[1]} resolves`);
  const team = graph(await read('team/index.html'));
  assert.ok(team.some(node => node['@type'] === 'AboutPage'));
  assert.ok(team.some(node => node['@type'] === 'BreadcrumbList'));
});

test('robots.txt, sitemap.xml and llms.txt are generated for the production domain', async () => {
  const robots = await read('robots.txt');
  assert.match(robots, new RegExp(`Sitemap: ${origin}/sitemap.xml`));
  assert.doesNotMatch(robots, /Disallow: \/\s*$/m);
  const sitemap = await read('sitemap.xml');
  for (const path of Object.keys(pages)) assert.ok(sitemap.includes(`<loc>${origin}${path}</loc>`), path);
  assert.doesNotMatch(sitemap, /admin|404/);
  const llms = await read('llms.txt');
  assert.match(llms, /^# Economics Masters Challenge\n\n> /);
  assert.match(llms, /## FAQ/);
});

test('admin and unknown pages are kept out of search results', async () => {
  const admin = await read('admin/index.html');
  const missing = await read('404.html');
  assert.match(admin, /<meta name="robots" content="noindex, nofollow" \/>/);
  assert.match(missing, /<meta name="robots" content="noindex" \/>/);
  assert.match(missing, /Page not found/);
  assert.doesNotMatch(admin + missing, /rel="canonical"|application\/ld\+json/);
});
