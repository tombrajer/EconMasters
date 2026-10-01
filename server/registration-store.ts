import { neon } from '@neondatabase/serverless';

export function registrationStore(databaseUrl: string | undefined, open: boolean) {
  const sql = databaseUrl ? neon(databaseUrl, { fetchOptions: { signal: AbortSignal.timeout(15000) } }) : null;
  return {
    async status() {
      if (!sql) throw new Error('Database is not configured');
      const [row] = await sql`SELECT used >= 33 AS full FROM registration_capacity WHERE id = 1`;
      if (!row) throw new Error('Capacity configuration missing');
      return { full: Boolean(row.full), open };
    },
    async submit(values: Record<string, string>, requestId: string) {
      if (!open) return { code: 'closed' };
      if (!sql) throw new Error('Database is not configured');
      const [row] = await sql`SELECT register_team(${JSON.stringify(values)}::jsonb, ${requestId}::uuid) AS result`;
      return row.result as { code: string; id?: string };
    },
  };
}
