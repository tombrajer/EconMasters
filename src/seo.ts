import { content, eligibility, preparation, previousPartners, schedule, site } from './content';

// The one production origin. Every canonical, sitemap entry, social card and
// structured-data ID is built from it, so moving the site is a one-line change.
export const origin = 'https://www.econmasterschallenge.com';

export type Route = '/' | '/register' | '/team' | '/privacy' | '/admin' | '/404';

type Page = {
  title: string;
  description: string;
  index: boolean;
  type?: 'WebPage' | 'AboutPage' | 'ContactPage';
  breadcrumb?: string;
  images?: string[];
};

const summary = 'A student-run economics competition for high school teams of three.';
const ogImage = { src: '/og-sharing.png', width: 1200, height: 630, alt: 'Economics Masters Challenge. Student economics competition, teams of three, above a supply and demand diagram.' };

export const pages: Record<Route, Page> = {
  '/': {
    title: 'Economics Masters Challenge | High School Economics Competition',
    description: 'A student-run economics competition for high school teams of three. Round 1 is a timed micro and macro exam; Round 2 is a real-world case presented to judges.',
    index: true,
    images: content.gallery.map(photo => photo.src),
  },
  '/register': {
    title: 'Register Your Team | Economics Masters Challenge',
    description: 'Register a team of three high school students for the Economics Masters Challenge: a multiple-choice economics exam, then a case presented to the judges.',
    index: true,
    breadcrumb: 'Registration',
  },
  '/team': {
    title: 'Founders & Organising Team | Economics Masters Challenge',
    description: 'Meet Max Gajdoš, Minh Anh Vu and Laura Lávičková, the high school students who founded the Economics Masters Challenge, and the team that runs it.',
    index: true,
    type: 'AboutPage',
    breadcrumb: 'Team',
    images: content.founders.map(founder => founder.src),
  },
  '/privacy': {
    title: 'Privacy Notice | Economics Masters Challenge',
    description: 'How the Economics Masters Challenge collects, uses and protects personal data under the GDPR.',
    index: true,
    breadcrumb: 'Privacy',
  },
  '/admin': { title: 'Admin | Economics Masters Challenge', description: 'Organiser access.', index: false },
  '/404': { title: 'Page Not Found | Economics Masters Challenge', description: 'This page does not exist.', index: false },
};

export const indexedRoutes = (Object.keys(pages) as Route[]).filter(route => pages[route].index);

export function routeFor(path: string): Route {
  const route = path.replace(/\/index\.html$/, '/').replace(/\.html$/, '').replace(/(.)\/$/, '$1') || '/';
  return route in pages ? route as Route : '/404';
}

const url = (path: string) => `${origin}${path === '/' ? '/' : path}`;
const ids = {
  organization: `${origin}/#organization`,
  website: `${origin}/#website`,
  series: `${origin}/#event-series`,
  edition2026: `${origin}/#edition-2026`,
  youthVoice: `${origin}/#youth-voice`,
};

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// JSON inside <script> must not be able to close the tag.
const safeJson = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');

function organization() {
  return {
    '@type': 'Organization',
    '@id': ids.organization,
    name: site.name,
    alternateName: ['EMC', 'Econ Masters Challenge'],
    url: url('/'),
    description: summary,
    email: site.email,
    logo: { '@type': 'ImageObject', url: url('/favicon-512.png'), width: 512, height: 512 },
    image: url(ogImage.src),
    founder: content.founders.map(founder => ({
      '@type': 'Person',
      name: founder.name,
      jobTitle: founder.role,
      image: url(founder.src),
      sameAs: founder.linkedin ? [founder.linkedin] : undefined,
    })),
    parentOrganization: {
      '@type': 'Organization',
      '@id': ids.youthVoice,
      name: 'Youth Voice',
      description: 'A student-led platform making economics more accessible through writing, events, and academic initiatives.',
      email: site.email,
      sameAs: [site.instagram.split('?')[0]],
    },
    contactPoint: { '@type': 'ContactPoint', contactType: 'enquiries', email: site.email, availableLanguage: ['en'] },
    knowsAbout: ['Economics', 'Microeconomics', 'Macroeconomics', 'Case competitions', 'AP Economics', 'IB Economics'],
  };
}

const audience = { '@type': 'EducationalAudience', educationalRole: 'student', audienceType: 'High school students' };

function eventSeries() {
  return {
    '@type': 'EventSeries',
    '@id': ids.series,
    name: site.name,
    description: `${summary} ${content.rounds.map(round => `Round ${Number(round.index)}, ${round.title}: ${round.lead}`).join(' ')}`,
    url: url('/'),
    image: url(ogImage.src),
    organizer: { '@id': ids.organization },
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    audience,
    subEvent: [{ '@id': ids.edition2026 }],
  };
}

// The 2026 edition is the only one with a confirmed date. Add the next edition
// here once its date and venue are announced; Google needs both for event results.
function edition2026() {
  return {
    '@type': 'EducationEvent',
    '@id': ids.edition2026,
    name: `${site.name} 2026`,
    description: `The 2026 edition of the ${site.name}: high school teams of three sat a multiple-choice economics exam, then solved a real-world case and presented it to the judges.`,
    startDate: '2026-05-29',
    endDate: '2026-05-29',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@type': 'Place', name: site.host },
    image: content.gallery.map(photo => url(photo.src)),
    organizer: { '@id': ids.organization },
    superEvent: { '@id': ids.series },
    audience,
    educationalLevel: 'High school',
    sponsor: previousPartners.find(past => past.edition === '2026')?.partners.map(partner => ({ '@type': 'Organization', name: partner.name, url: partner.href })),
    contributor: content.previousJudges.find(past => past.edition === '2026')?.judges.map(judge => ({ '@type': 'Person', name: judge.name, image: url(judge.image) })),
  };
}

function faqPage() {
  return {
    '@type': 'FAQPage',
    '@id': `${url('/')}#faq`,
    mainEntity: content.faq.map(item => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })),
  };
}

export function structuredData(route: Route) {
  const page = pages[route];
  const pageUrl = url(route);
  const webPage = {
    '@type': page.type ?? 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: page.title,
    description: page.description,
    inLanguage: 'en',
    isPartOf: { '@id': ids.website },
    about: { '@id': route === '/' ? ids.series : ids.organization },
    primaryImageOfPage: { '@type': 'ImageObject', url: url(ogImage.src), width: ogImage.width, height: ogImage.height },
    breadcrumb: page.breadcrumb ? { '@id': `${pageUrl}#breadcrumb` } : undefined,
    mainEntity: route === '/team' ? { '@id': ids.organization } : undefined,
  };
  const graph: object[] = [
    { '@type': 'WebSite', '@id': ids.website, url: url('/'), name: site.name, alternateName: 'EMC', description: summary, inLanguage: 'en', publisher: { '@id': ids.organization } },
    organization(),
    webPage,
  ];
  if (page.breadcrumb) graph.push({
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: url('/') },
      { '@type': 'ListItem', position: 2, name: page.breadcrumb, item: pageUrl },
    ],
  });
  if (route === '/') graph.push(eventSeries(), edition2026(), faqPage());
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function head(route: Route) {
  const page = pages[route];
  const pageUrl = url(route);
  const robots = page.index ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' : route === '/admin' ? 'noindex, nofollow' : 'noindex';
  const tags = [
    `<title>${escapeHtml(page.title)}</title>`,
    `<meta name="description" content="${escapeHtml(page.description)}" />`,
    `<meta name="robots" content="${robots}" />`,
  ];
  if (page.index) tags.push(
    `<link rel="canonical" href="${pageUrl}" />`,
    `<meta property="og:site_name" content="${site.name}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${pageUrl}" />`,
    `<meta property="og:title" content="${escapeHtml(page.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(page.description)}" />`,
    `<meta property="og:image" content="${url(ogImage.src)}" />`,
    `<meta property="og:image:type" content="image/png" />`,
    `<meta property="og:image:width" content="${ogImage.width}" />`,
    `<meta property="og:image:height" content="${ogImage.height}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(ogImage.alt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(page.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`,
    `<meta name="twitter:image" content="${url(ogImage.src)}" />`,
    `<meta name="twitter:image:alt" content="${escapeHtml(ogImage.alt)}" />`,
    `<script type="application/ld+json">${safeJson(structuredData(route))}</script>`,
  );
  return tags.join('\n    ');
}

export function sitemap() {
  const entries = indexedRoutes.map(route => {
    const images = (pages[route].images ?? []).map(src => `\n    <image:image><image:loc>${url(src)}</image:loc></image:image>`).join('');
    return `  <url>\n    <loc>${url(route)}</loc>${images}\n  </url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${entries.join('\n')}\n</urlset>\n`;
}

export function robots() {
  return `# ${site.name}. Search engines and AI assistants are welcome.\nUser-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${url('/sitemap.xml')}\n`;
}

// https://llmstxt.org: a plain summary for AI assistants, built from the same content as the pages.
export function llms() {
  const [foundations, caseRound] = content.rounds;
  const list = (items: readonly string[]) => items.map(item => `- ${item}`).join('\n');
  return `# ${site.name}

> ${summary} Teams compete in two rounds: a timed multiple-choice exam on microeconomics and macroeconomics, then a real-world economics and business case that each team solves and presents to a panel of judges. Organised entirely by high school students as an initiative of Youth Voice.

## Format

### Round 1: ${foundations.title}
${foundations.lead}
${list(foundations.facts?.map(([label, value]) => `${label}: ${value}`) ?? [])}

### Round 2: ${caseRound.title}
${caseRound.lead}
${list(caseRound.steps ?? [])}

The judges score: ${caseRound.points.join(', ').toLowerCase()}.

## Who can enter
${list(eligibility.map(([label, value]) => `${label}: ${value}`))}

## Competition day
${list(schedule.map(item => `${item.time}: ${item.title}${item.detail ? ` (${item.detail})` : ''}`))}

## What to prepare
${preparation.map(row => `### ${row.round}: ${row.title}\n${list(row.topics)}`).join('\n\n')}

## Previous edition
The 2026 edition took place on 29 May 2026 at ${site.host}. Judges: ${content.previousJudges[0].judges.map(judge => `${judge.name} (${judge.background})`).join('; ')}. Sponsors: ${previousPartners[0].partners.map(partner => partner.name).join(', ')}.

## FAQ
${content.faq.map(item => `### ${item.q}\n${item.a}`).join('\n\n')}

## Pages
- [Home](${url('/')}): format, schedule, preparation, judges, partners and FAQ
- [Registration](${url('/register')}): register a team of three
- [Team](${url('/team')}): founders and organising team
- [Privacy](${url('/privacy')}): how registration data is handled

## Contact
- Email: ${site.email}
- Instagram: ${site.instagram.split('?')[0]}
`;
}
