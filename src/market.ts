// Normalised model: quantity q and price p both run 0..1 inside the plot.
export const SPAN = 0.7;
export const BASE = 0.1;
export const supply = (q: number) => 0.1 + 0.74 * Math.pow(Math.max(0, q) / SPAN, 1.25);
export const demand = (q: number) => 0.08 + 0.82 * Math.pow(Math.max(0, 1 - q / SPAN), 1.45);

export function equilibrium(demandShift: number, supplyShift: number) {
  let low = 0;
  let high = 1;
  for (let step = 0; step < 32; step++) {
    const q = (low + high) / 2;
    if (demand(q - demandShift) > supply(q - supplyShift)) low = q; else high = q;
  }
  const q = (low + high) / 2;
  return { q, p: supply(q - supplyShift) };
}

const ease = (value: number) => value <= 0 ? 0 : value >= 1 ? 1 : value * value * (3 - 2 * value);

const CYCLE = 20;
const SHIFT = 0.14;
/** Demand rises and returns, then supply rises and returns. */
export function scenario(time: number) {
  const t = time % CYCLE;
  const demandShift = BASE + SHIFT * (ease((t - 1.5) / 2.5) - ease((t - 7) / 2.5));
  const supplyShift = BASE + SHIFT * (ease((t - 11.5) / 2.5) - ease((t - 17) / 2.5));
  const label = t > 1.5 && t < 9.5 ? (t < 7 ? 'Demand increases · P↑ Q↑' : 'Demand returns') : t > 11.5 && t < 19.5 ? (t < 17 ? 'Supply increases · P↓ Q↑' : 'Supply returns') : 'Market equilibrium';
  return { demandShift, supplyShift, label };
}

