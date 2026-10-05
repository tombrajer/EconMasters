import { neon } from '@neondatabase/serverless';

export const MAX_ATTEMPTS = 5;

export type AdminRegistration = {
  slot: number;
  id: string;
  team: string;
  school: string;
  members: string[];
  captain: string;
  email: string;
  details: Record<string, string>;
  createdAt: string;
};

export type Attempt = { allowed: true; attemptsLeft: number } | { allowed: false; retryAfter: number };

export type AdminStore = {
  reserveAttempt(): Promise<Attempt>;
  clearAttempts(): Promise<void>;
  list(): Promise<AdminRegistration[]>;
};

// One shared counter, because a 4-digit code has only 10,000 possibilities. Each attempt is counted
// before the code is compared, so parallel guesses cannot slip past the limit. Every lockout is four
// times longer than the last (15 min, 1 h, 4 h, 16 h, then 24 h) until a correct code resets it.
export const SQL = {
  table: `CREATE TABLE IF NOT EXISTS admin_throttle (
    id integer PRIMARY KEY CHECK (id = 1),
    failures integer NOT NULL DEFAULT 0,
    strikes integer NOT NULL DEFAULT 0,
    locked_until timestamptz
  )`,
  seed: `INSERT INTO admin_throttle(id) VALUES (1) ON CONFLICT DO NOTHING`,
  reserve: `UPDATE admin_throttle
    SET failures = CASE WHEN failures + 1 >= ${MAX_ATTEMPTS} THEN 0 ELSE failures + 1 END,
        strikes = CASE WHEN failures + 1 >= ${MAX_ATTEMPTS} THEN strikes + 1 ELSE strikes END,
        locked_until = CASE WHEN failures + 1 >= ${MAX_ATTEMPTS}
          THEN now() + LEAST(interval '24 hours', interval '15 minutes' * power(4, strikes))
          ELSE locked_until END
    WHERE id = 1 AND (locked_until IS NULL OR locked_until <= now())
    RETURNING failures, (locked_until IS NOT NULL AND locked_until > now()) AS locked_now`,
  wait: `SELECT GREATEST(1, ceil(extract(epoch FROM locked_until - now())))::int AS wait
    FROM admin_throttle WHERE id = 1`,
  clear: `UPDATE admin_throttle SET failures = 0, strikes = 0, locked_until = NULL WHERE id = 1`,
  list: `SELECT slot, id, team, school, members, captain, email, details, created_at
    FROM registrations ORDER BY slot`,
};

export function adminStore(databaseUrl: string | undefined): AdminStore | null {
  if (!databaseUrl) return null;
  const sql = neon(databaseUrl, { fetchOptions: { signal: AbortSignal.timeout(15000) } });
  let ready: Promise<unknown> | null = null;
  const ensure = () => ready ??= sql.query(SQL.table).then(() => sql.query(SQL.seed)).catch(error => { ready = null; throw error; });
  return {
    async reserveAttempt() {
      await ensure();
      const [row] = await sql.query(SQL.reserve);
      if (row) return { allowed: true, attemptsLeft: row.locked_now ? 0 : MAX_ATTEMPTS - Number(row.failures) };
      const [lock] = await sql.query(SQL.wait);
      return { allowed: false, retryAfter: Number(lock?.wait ?? 900) };
    },
    async clearAttempts() {
      await ensure();
      await sql.query(SQL.clear);
    },
    async list() {
      const rows = await sql.query(SQL.list);
      return rows.map(row => ({
        slot: Number(row.slot),
        id: String(row.id),
        team: String(row.team),
        school: String(row.school),
        members: (row.members as unknown[]).map(String),
        captain: String(row.captain),
        email: String(row.email),
        details: Object.fromEntries(Object.entries((row.details ?? {}) as Record<string, unknown>).map(([key, value]) => [key, String(value ?? '')])),
        createdAt: new Date(row.created_at as string).toISOString(),
      }));
    },
  };
}
