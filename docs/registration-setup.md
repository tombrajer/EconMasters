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

## Admin page and Excel export

The footer links to `/admin`: a four-digit passcode, then the list of registered teams and an **Export Excel** button (a real `.xlsx`, built in the browser; nothing is stored or sent anywhere).

1. In the Vercel project's environment variables set `ADMIN_PASSCODE` to four digits (server only, never a `VITE_` name) and redeploy. Until it is set, `/admin` reports that admin is not set up.
2. No manual database step: the first admin request creates a small `admin_throttle` table in the same database (the owner connection from `DATABASE_URL` is enough).

A four-digit code can be guessed in at most 10,000 tries, so the server counts every attempt **before** comparing the code, and parallel requests cannot get around it. Five wrong attempts lock the page for 15 minutes; each following lockout is four times longer (1 h, 4 h, 16 h, then 24 h) until the right code resets it. The lock is shared by everyone, so someone guessing can also keep you locked out; to unlock yourself in an emergency run `UPDATE admin_throttle SET failures = 0, strikes = 0, locked_until = NULL;` in Neon. The code is kept in memory only, so refreshing the page asks for it again.

Treat the passcode as a convenience lock, not strong security: the page lists students' names and emails. Use a code that is not guessable (not 1234, not a year), do not share it in group chats, and change it in Vercel when someone who knew it leaves. Nothing links search engines to the page (`noindex`), but anyone can find the URL.

## Local development

`npm run dev` and `npm run preview` serve the frontend only. The form reports that registration is unavailable when the API is absent. Use `vercel dev` with a test `DATABASE_URL` and `REGISTRATION_OPEN=true` for end-to-end testing; no fake success or browser-only capacity counter is used.
