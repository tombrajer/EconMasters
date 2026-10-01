import { registrationStore } from '../server/registration-store.ts';
import { validateRegistration } from '../src/behavior.ts';

type Store = {
  status(): Promise<{ full: boolean; open: boolean }>;
  submit(values: Record<string, string>, requestId: string): Promise<{ code: string; id?: string }>;
};

const json = (body: unknown, status = 200) => Response.json(body, {
  status, headers: { 'Cache-Control': 'no-store' },
});

export async function handleRegistration(request: Request, store: Store): Promise<Response> {
  try {
    if (request.method === 'GET') return json(await store.status());
    if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'GET, POST' } });
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) return json({ message: 'Invalid request origin.' }, 403);
    if (!request.headers.get('content-type')?.includes('application/json')) return json({ message: 'Expected JSON.' }, 415);
    const text = await request.text();
    if (text.length > 16000) return json({ message: 'Entry is too large.' }, 413);
    let body;
    try { body = JSON.parse(text); } catch { return json({ message: 'Invalid entry.' }, 400); }
    if (!body || typeof body !== 'object' || Array.isArray(body) || !body.values || typeof body.values !== 'object' || Array.isArray(body.values)) {
      return json({ message: 'Invalid entry.' }, 400);
    }
    if (typeof body.requestId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.requestId)) {
      return json({ message: 'Invalid submission identifier.' }, 400);
    }
    const names = ['team', 'school', 'm1', 'm2', 'm3', 'program', 'grade', 'country', 'captain', 'email', 'phone', 'source', 'notes'];
    const values: Record<string, string> = {};
    for (const name of names) {
      const value = body.values[name] ?? '';
      if (typeof value !== 'string' || value.length > (['source', 'notes'].includes(name) ? 2000 : 250)) {
        return json({ message: 'Please shorten the highlighted field.', errors: { [name]: 'This field is too long.' } }, 400);
      }
      values[name] = value.trim();
    }
    const errors = validateRegistration(values);
    if (Object.keys(errors).length) return json({ message: 'Enter all three students and required details.', errors }, 400);
    const result = await store.submit(values, body.requestId);
    if (result.code === 'full') return json({ code: 'full', message: 'Capacity reached. Registration is closed.' }, 409);
    if (result.code === 'closed') return json({ code: 'closed', message: 'Registration is not open yet.' }, 409);
    if (result.code === 'duplicate') return json({ message: 'A team with this name and school is already registered.' }, 409);
    if (result.code !== 'saved' || !result.id) throw new Error('Unexpected registration result');
    return json({ id: result.id, message: 'Your team is registered.' }, 201);
  } catch {
    return json({ message: 'Registration is temporarily unavailable. Please try again later.' }, 503);
  }
}

export default {
  fetch(request: Request) {
    const env = (globalThis as typeof globalThis & { process: { env: Record<string, string | undefined> } }).process.env;
    return handleRegistration(request, registrationStore(env.DATABASE_URL, env.REGISTRATION_OPEN === 'true'));
  },
};
