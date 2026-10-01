import { test } from 'node:test';
import assert from 'node:assert/strict';
import { economicProgress, graphProgress, validateRegistration } from '../src/behavior.ts';

test('desktop economics diagrams animate while in view on laptop and PC', () => {
  for (const viewport of [800, 1080]) {
    const height = 300;
    assert.equal(economicProgress(viewport * .75 - height / 2, height, viewport), 0);
    const middle = economicProgress(viewport * .525 - height / 2, height, viewport);
    assert.ok(Math.abs(middle - .5) < .001);
    assert.equal(economicProgress(viewport * .3 - height / 2, height, viewport), 1);
    assert.equal(economicProgress(viewport, height, viewport, true), 1);
  }
});

test('graph remains bounded and reverses as the visitor scrolls back', () => {
  assert.equal(graphProgress(1200, 1000, 800), 0);
  assert.equal(graphProgress(-1000, 1000, 800), 1);
  const forward = graphProgress(100, 1000, 800);
  const backward = graphProgress(300, 1000, 800);
  assert.ok(forward > backward);
});

test('reduced motion displays the complete graph before entering the viewport', () => {
  assert.equal(graphProgress(1200, 1000, 800, true), 1);
});

test('journey progresses across the viewport and finishes near the top', () => {
  assert.equal(graphProgress(680, 300, 800), 0);
  assert.ok(graphProgress(250, 300, 800) < 0.6);
  assert.ok(graphProgress(0, 300, 800) < 1);
  assert.equal(graphProgress(-140, 300, 800), 1);
});

test('whitespace-only team fields are rejected with field-specific messages', () => {
  const errors = validateRegistration({ team: ' ', school: '', m1: '', m2: '', m3: '', captain: '', email: '' });
  assert.equal(Object.keys(errors).length, 7);
  assert.match(errors.team, /team name/i);
  assert.match(errors.m3, /member 3/i);
});

test('an invalid email cannot pass preview validation', () => {
  assert.match(validateRegistration({ ...validTeam, email: 'no-address' }).email, /valid email/i);
});

const validTeam = { team: 'Market Minds', school: 'Example School', m1: 'Alex', m2: 'Sam', m3: 'Jordan', captain: 'Alex', email: 'team@example.org' };
test('a complete team needs no optional fields to pass validation', () => {
  assert.deepEqual(validateRegistration(validTeam), {});
});

test('registration requires three different students', () => {
  for (const member of ['m1', 'm2', 'm3']) {
    assert.ok(validateRegistration({ ...validTeam, [member]: ' ' })[member]);
  }
  assert.match(validateRegistration({ ...validTeam, m3: ' alex ' }).m3, /different student/);
});
