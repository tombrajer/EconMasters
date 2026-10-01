# Registration on Vercel + Neon

Capacity: 33 teams, exactly three students per team = 99 participants.
No Supabase project is used. The browser talks only to `/api/registration`.

## Connect storage and deploy

1. Create/import this repository as a Vercel project using the Vite preset. The build command and output folder are in `vercel.json`.
2. In that project's Storage tab, connect Neon Postgres through the Vercel Marketplace. Choose your preferred plan and region and complete any provider terms yourself. Use a dedicated database for this competition.
3. Run `database/registration.sql` in Neon's SQL editor using the same database owner that Vercel's `DATABASE_URL` connects as. This creates the tables and atomic registration function. Do not run it in an unrelated database.
4. Verify `DATABASE_URL` is available to the Vercel server in the chosen environment. Never expose it using a `VITE_` prefix.
5. Set `REGISTRATION_OPEN=true` when ready to accept entries; otherwise keep `false`. Redeploy after changing environment variables.
6. Use a separate Neon branch/database for preview and development; do not connect previews to real registrations.
7. Verify `/api/registration` returns `{"full":false,"open":true}`, submit a test team in the test database, then verify the persisted record. Run the capacity test below before opening production.

## Verify the database limit

In a disposable test database, apply the schema, then submit 34 different teams concurrently with different submission UUIDs. Exactly 33 should succeed; one must receive HTTP 409 with `code: full`. Query `SELECT count(*), max(slot) FROM registrations`: both values must be 33. Retry one successful submission with the same UUID and unchanged details: it must return the same reference without adding another row.

The `register_team` function locks the singleton capacity row for the entire transaction, then checks retries and duplicates, inserts the entry, and updates the counter. A unique slot constrained to 1–33 also prevents the table from holding more than 33 teams. Three nonempty distinct student entries are checked both by the API and database. Names alone are not identity verification.

## Manage entries

Organizers can view/export `registrations` in Neon's console. No public endpoint exposes student details. Confirmation appears on the website after saving; email confirmations are not implemented.

Entries are append-only for this edition. Do not manually delete rows to reopen slots: the counter and slot allocation intentionally do not support cancellations. A future edition needs a fresh database or an explicit edition migration.

Protect the public POST endpoint with Vercel Firewall rate limits before launching publicly to prevent automated junk teams exhausting places. The capacity cap is a storage invariant; it does not verify that submitters are real students.

## Local development

`npm run dev` and `npm run preview` serve the frontend only. The form reports that registration is unavailable when the API is absent. Use `vercel dev` with a test `DATABASE_URL` and `REGISTRATION_OPEN=true` for end-to-end testing; no fake success or browser-only capacity counter is used.
