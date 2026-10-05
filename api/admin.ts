import { adminStore, type AdminStore } from '../server/admin-store.ts';

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) => Response.json(body, {
  status, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', ...headers },
});

const digest = async (value: string) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));

// Hashing first gives both sides equal length, so the comparison time does not depend on how many digits match.
async function sameCode(a: string, b: string) {
  const [left, right] = await Promise.all([digest(a), digest(b)]);
  let difference = 0;
  for (let index = 0; index < left.length; index++) difference |= left[index] ^ right[index];
  return difference === 0;
}

export async function handleAdmin(request: Request, store: AdminStore | null, passcode: string | undefined): Promise<Response> {
  try {
    if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST', 'Cache-Control': 'no-store' } });
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) return json({ message: 'Invalid request origin.' }, 403);
    if (!request.headers.get('content-type')?.includes('application/json')) return json({ message: 'Expected JSON.' }, 415);
    const text = await request.text();
    if (text.length > 256) return json({ message: 'Invalid request.' }, 413);
    let body;
    try { body = JSON.parse(text); } catch { return json({ message: 'Invalid request.' }, 400); }
    const attempt = body && typeof body === 'object' ? body.passcode : undefined;
    if (typeof attempt !== 'string' || !/^\d{4}$/.test(attempt)) return json({ message: 'Enter the four-digit passcode.' }, 400);
    if (!store || !passcode || !/^\d{4}$/.test(passcode)) return json({ code: 'unconfigured', message: 'Admin is not set up yet.' }, 503);

    const reservation = await store.reserveAttempt();
    if (!reservation.allowed) {
      return json({ code: 'locked', message: 'Too many attempts. Try again later.', retryAfter: reservation.retryAfter }, 429, { 'Retry-After': String(reservation.retryAfter) });
    }
    if (!await sameCode(attempt, passcode)) {
      return json({ message: 'Incorrect passcode.', attemptsLeft: reservation.attemptsLeft }, 401);
    }
    await store.clearAttempts();
    return json({ registrations: await store.list(), capacity: 33 });
  } catch {
    return json({ message: 'Admin is temporarily unavailable. Please try again later.' }, 503);
  }
}

export default {
  fetch(request: Request) {
    const env = (globalThis as typeof globalThis & { process: { env: Record<string, string | undefined> } }).process.env;
    return handleAdmin(request, adminStore(env.DATABASE_URL), env.ADMIN_PASSCODE);
  },
};
