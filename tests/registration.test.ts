import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleRegistration } from '../api/registration.ts';

const values = { team: 'Market Minds', school: 'Example School', m1: 'Alex Smith', m2: 'Sam Jones', m3: 'Jordan Lee', captain: 'Alex Smith', email: 'team@example.org' };
const id = '5418c821-7245-4844-82b4-d5f1a3b63884';
const request = (entry = values) => new Request('https://example.org/api/registration', {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://example.org' },
  body: JSON.stringify({ values: entry, requestId: id }),
});
const store = { async status() { return { full: false, open: true }; }, async submit() { return { code: 'saved', id }; } };

test('server rejects fewer than three students before reaching storage', async () => {
  let called = false;
  for (const member of ['m1', 'm2', 'm3']) {
    const response = await handleRegistration(request({ ...values, [member]: '' }), {
      ...store, async submit() { called = true; return { code: 'saved', id }; },
    });
    assert.equal(response.status, 400);
    assert.ok((await response.json()).errors[member]);
  }
  assert.equal(called, false);
});

test('a filled database rejects a team with the capacity message', async () => {
  const response = await handleRegistration(request(), { ...store, async submit() { return { code: 'full' }; } });
  assert.equal(response.status, 409);
  assert.equal((await response.json()).message, 'Capacity reached. Registration is closed.');
});

test('confirmation is returned only after storage acknowledges saving', async () => {
  const response = await handleRegistration(request(), store);
  assert.equal(response.status, 201);
  assert.equal((await response.json()).id, id);
  const failed = await handleRegistration(request(), { ...store, async submit() { throw new Error('offline'); } });
  assert.equal(failed.status, 503);
  assert.equal((await failed.json()).id, undefined);
});

test('unknown storage responses cannot falsely confirm registration', async () => {
  const response = await handleRegistration(request(), { ...store, async submit() { return { code: 'saved' }; } });
  assert.equal(response.status, 503);
});

test('status is uncached and does not expose registered teams', async () => {
  const response = await handleRegistration(new Request('https://example.org/api/registration'), store);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { full: false, open: true });
});

test('cross-origin submissions and malformed JSON are rejected', async () => {
  const crossOrigin = new Request(request(), { headers: { 'Content-Type': 'application/json', Origin: 'https://other.org' } });
  assert.equal((await handleRegistration(crossOrigin, store)).status, 403);
  const malformed = new Request('https://example.org/api/registration', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal((await handleRegistration(malformed, store)).status, 400);
});

test('submissions carry a stable identifier and normalized student fields', async () => {
  let captured;
  await handleRegistration(request({ ...values, m1: '  Alex Smith  ' }), {
    ...store, async submit(entry, requestId) { captured = { entry, requestId }; return { code: 'saved', id }; },
  });
  assert.equal(captured.requestId, id);
  assert.equal(captured.entry.m1, values.m1);
});
