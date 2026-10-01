import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BASE, SPAN, supply, demand, equilibrium, scenario } from '../src/market.ts';

const baseline = equilibrium(BASE, BASE);

test('an increase in demand raises equilibrium price and quantity', () => {
  const state = scenario(5);
  const point = equilibrium(state.demandShift, state.supplyShift);
  assert.ok(point.p > baseline.p);
  assert.ok(point.q > baseline.q);
  assert.equal(state.supplyShift, BASE);
});

test('an increase in supply lowers price and raises quantity', () => {
  const state = scenario(15);
  const point = equilibrium(state.demandShift, state.supplyShift);
  assert.ok(point.p < baseline.p);
  assert.ok(point.q > baseline.q);
  assert.equal(state.demandShift, BASE);
});

test('the marker remains at the intersection and inside both drawn curves throughout the cycle', () => {
  for (let t = 0; t <= 20; t += .05) {
    const state = scenario(t);
    const point = equilibrium(state.demandShift, state.supplyShift);
    assert.ok(Math.abs(demand(point.q - state.demandShift) - supply(point.q - state.supplyShift)) < 1e-8);
    assert.ok(point.p > 0 && point.p < 1);
    for (const shift of [state.demandShift, state.supplyShift]) {
      assert.ok(point.q >= shift && point.q <= shift + SPAN);
    }
  }
});

test('both curves return to their original positions before the animation repeats', () => {
  for (const t of [0, 10, 20, 40]) {
    const state = scenario(t);
    assert.equal(state.demandShift, BASE);
    assert.equal(state.supplyShift, BASE);
    assert.deepEqual(equilibrium(state.demandShift, state.supplyShift), baseline);
  }
});
