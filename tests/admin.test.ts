import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleAdmin } from '../api/admin.ts';
import type { AdminRegistration, AdminStore } from '../server/admin-store.ts';

const entry: AdminRegistration = {
  slot: 1, id: '5418c821-7245-4844-82b4-d5f1a3b63884', team: 'Market Minds', school: 'Example School',
  members: ['Alex', 'Sam', 'Jordan'], captain: 'Alex', email: 'team@example.org', details: { phone: '123' }, createdAt: '2026-10-05T11:40:00.000Z',
};

function fakeStore(overrides: Partial<AdminStore> = {}) {
  const calls = { reserve: 0, clear: 0, list: 0, delete: 0 };
  const store: AdminStore = {
    async reserveAttempt() { calls.reserve++; return { allowed: true, attemptsLeft: 4 }; },
    async clearAttempts() { calls.clear++; },
    async list() { calls.list++; return [entry]; },
    async delete() { calls.delete++; return true; },
    ...overrides,
  };
  return { store, calls };
}

const post = (body: unknown, headers: Record<string, string> = {}) => new Request('https://example.org/api/admin', {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://example.org', ...headers },
  body: typeof body === 'string' ? body : JSON.stringify(body),
});

test('the correct passcode returns registrations and clears the attempt counter', async () => {
  const { store, calls } = fakeStore();
  const response = await handleAdmin(post({ passcode: '4821' }), store, '4821');
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const body = await response.json();
  assert.equal(body.registrations.length, 1);
  assert.equal(body.capacity, 33);
  assert.deepEqual([calls.reserve, calls.clear, calls.list], [1, 1, 1]);
});

test('a wrong passcode is rejected and never reveals registrations', async () => {
  const { store, calls } = fakeStore();
  const response = await handleAdmin(post({ passcode: '0000' }), store, '4821');
  assert.equal(response.status, 401);
  const body = await response.json();
  assert.equal(body.registrations, undefined);
  assert.equal(body.attemptsLeft, 4);
  assert.deepEqual([calls.clear, calls.list], [0, 0]);
});

test('a locked admin is refused before the passcode is even compared', async () => {
  const { store, calls } = fakeStore({ async reserveAttempt() { return { allowed: false, retryAfter: 900 }; } });
  const response = await handleAdmin(post({ passcode: '4821' }), store, '4821');
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('retry-after'), '900');
  assert.equal((await response.json()).registrations, undefined);
  assert.deepEqual([calls.clear, calls.list], [0, 0]);
});

test('the passcode must be exactly four digits', async () => {
  const { store, calls } = fakeStore();
  for (const passcode of ['123', '12345', 'abcd', '12 4', 1234, null, undefined, ['1234']]) {
    const response = await handleAdmin(post({ passcode }), store, '4821');
    assert.equal(response.status, 400, String(passcode));
  }
  assert.equal(calls.reserve, 0);
});

test('admin stays closed until a four-digit passcode and a database are configured', async () => {
  const { store, calls } = fakeStore();
  for (const [configured, db] of [[undefined, store], ['', store], ['12', store], ['abcd', store], ['4821', null]] as const) {
    const response = await handleAdmin(post({ passcode: '4821' }), db, configured);
    assert.equal(response.status, 503);
    assert.equal((await response.json()).code, 'unconfigured');
  }
  assert.equal(calls.list, 0);
});

test('only same-origin JSON POST requests are accepted', async () => {
  const { store } = fakeStore();
  assert.equal((await handleAdmin(new Request('https://example.org/api/admin'), store, '4821')).status, 405);
  assert.equal((await handleAdmin(post({ passcode: '4821' }, { Origin: 'https://evil.example' }), store, '4821')).status, 403);
  assert.equal((await handleAdmin(post({ passcode: '4821' }, { 'Content-Type': 'text/plain' }), store, '4821')).status, 415);
  assert.equal((await handleAdmin(post('{'), store, '4821')).status, 400);
  assert.equal((await handleAdmin(post('x'.repeat(300)), store, '4821')).status, 413);
});

test('storage failures never unlock the admin', async () => {
  const offline = fakeStore({ async reserveAttempt() { throw new Error('offline'); } });
  const response = await handleAdmin(post({ passcode: '4821' }), offline.store, '4821');
  assert.equal(response.status, 503);
  assert.equal((await response.json()).registrations, undefined);
});

const remove = (passcode: string, id: unknown = entry.id) => new Request('https://example.org/api/admin', {
  method: 'DELETE', headers: { 'Content-Type': 'application/json', Origin: 'https://example.org' },
  body: JSON.stringify({ passcode, id }),
});

test('deletion requires the correct password and returns the deleted ID', async () => {
  const { store, calls } = fakeStore();
  assert.equal((await handleAdmin(remove('0000'), store, '0987')).status, 401);
  assert.equal(calls.delete, 0);
  const response = await handleAdmin(remove('0987'), store, '0987');
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { deleted: entry.id });
  assert.equal(calls.delete, 1);
});

test('invalid IDs and missing registrations are handled without reporting success', async () => {
  const { store, calls } = fakeStore();
  for (const id of [null, 123, 'invalid']) {
    assert.equal((await handleAdmin(remove('0987', id), store, '0987')).status, 400);
  }
  assert.equal(calls.delete, 0);
  const missing = fakeStore({ async delete() { return false; } });
  assert.equal((await handleAdmin(remove('0987'), missing.store, '0987')).status, 404);
});

test('locked and unavailable storage never allow deletion', async () => {
  const locked = fakeStore({ async reserveAttempt() { return { allowed: false, retryAfter: 900 }; } });
  assert.equal((await handleAdmin(remove('0987'), locked.store, '0987')).status, 429);
  assert.equal(locked.calls.delete, 0);
  const offline = fakeStore({ async delete() { throw new Error('offline'); } });
  assert.equal((await handleAdmin(remove('0987'), offline.store, '0987')).status, 503);
});
