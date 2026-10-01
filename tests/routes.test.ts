import { test } from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

test('clean registration URL has an HTML file for Vite static fallback', async () => {
  await assert.doesNotReject(access(new URL('../dist/register.html', import.meta.url)));
  const html = await readFile(new URL('../dist/register.html', import.meta.url), 'utf8');
  assert.match(html, /register-main/);
  assert.doesNotMatch(html, /<section class="hero"/);
});

test('both prerendered routes contain content and do not enable submission without JavaScript', async () => {
  const home = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  const registration = await readFile(new URL('../dist/register/index.html', import.meta.url), 'utf8');
  assert.match(home, /Economics.*?<br\/>.*?Masters Challenge/);
  assert.match(home, /gallery/);
  assert.match(home, /og:image" content="https:\/\/econmasters\.vercel\.app\/og-image\.png"/);
  assert.match(registration, /disabled=""/);
  assert.doesNotMatch(home + registration, /Prague|Praha|Prahy/i);
});
