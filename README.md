# Economics Masters Challenge

React, TypeScript, and Vite. Two pages: `/` and `/register`.

```sh
npm install
npm run dev
```

```sh
npm test
npm run preview
```

`npm test` includes the production build and type check before the automated checks.

The production build prerenders both pages, so their content and native disclosures work without JavaScript. Serve `dist/` with clean directory URLs; `/register/index.html` is included.

Registration uses a Vercel API and Neon Postgres. Exactly three students are required; capacity is limited atomically to 33 teams (99 participants). Setup is documented in [docs/registration-setup.md](docs/registration-setup.md). Registration remains unavailable until the database is connected and the schema is applied, and closed until `REGISTRATION_OPEN=true`. JavaScript-disabled browsers cannot submit.

Original competition facts and biographies are in `src/content.json`. Shared facts and form fields are in `src/content.ts`. Photos come from the existing competition site; their source URLs are recorded in `public/photos/provenance.json`. Self-hosted fonts include their SIL Open Font Licenses.

The monochrome hero uses a native canvas with illustrative supply-and-demand curves over a dotted landscape. It pauses offscreen and in background tabs. A static SVG provides the no-JavaScript fallback. Reduced motion keeps the hero still. The competition journey uses SVG and a passive scroll listener, scheduled with `requestAnimationFrame`; reduced motion displays its completed line. Academic graph curves draw on viewport entry; gallery photos use subtle scroll parallax bounded to the available crop area. Reduced motion disables those movements. No animation library is used.
