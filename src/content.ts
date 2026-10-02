import recovered from './content.json';

export const content = recovered;
export const site = {
  name: 'Economics Masters Challenge',
  email: 'youthvoiceeducation@gmail.com',
  instagram: 'https://www.instagram.com/youthvoiceedu?igsi=MTd4dHFzZ2RlZGxzYw',
  host: 'Sunny Canadian International School',
};
export const eligibility = [
  ['Eligible grades', 'All high school grades'],
  ['Team size', 'Exactly 3 students'],
  ['Academic programs', 'AP / IB / other'],
  ['Next edition', 'To be announced'],
  ['Registration deadline', 'To be announced'],
];
export const partners = [
  { name: 'Visa', href: 'https://www.visa.cz/', logo: '/logos/visa.svg', width: 1000, height: 325 },
  { name: 'Bankovnictví', href: 'https://bankovnictvionline.cz/', logo: '/logos/bankovnictvi.png', width: 1038, height: 133 },
  { name: 'EAAPS – European Association of AP Schools', href: 'https://www.eaaps.eu/', logo: '/logos/eaaps.png', width: 320, height: 318 },
];
export const schedule = [
  { time: '08:00', title: 'Arrival & registration' },
  { time: '08:30', title: 'Opening' },
  { time: 'Round 1', title: 'Analytical Foundations', detail: 'Multiple-choice exam', key: true },
  { time: 'Break', title: 'Lunch & networking' },
  { time: 'Round 2', title: 'Case Challenge', detail: 'Solve the case, present to the judges', key: true },
  { time: 'Judging', title: 'Panel deliberation' },
  { time: 'Results', title: 'Winners announced' },
  { time: '16:00', title: 'Closing' },
];
export const edition = [
  ['Date', 'May 29, 2026'],
  ['Participants', '~40 students'],
  ['Venue', 'Sunny Canadian International School'],
];
export const fields = [
  { title: 'Team information', fields: [
    { name: 'team', label: 'Team name', required: true },
    { name: 'school', label: 'School', required: true },
    { name: 'm1', label: 'Team member 1', required: true },
    { name: 'm2', label: 'Team member 2', required: true },
    { name: 'm3', label: 'Team member 3', required: true },
    { name: 'program', label: 'Academic program', placeholder: 'AP / IB / other' },
    { name: 'grade', label: 'Grade / year' },
    { name: 'country', label: 'Country' },
  ] },
  { title: 'Contact', fields: [
    { name: 'captain', label: 'Team captain', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'tel' },
  ] },
  { title: 'Additional information', fields: [
    { name: 'source', label: 'How did you hear about Economics Masters Challenge?', textarea: true },
    { name: 'notes', label: 'Anything we should know?', textarea: true },
  ] },
];

export const preparation = [
  { round: 'Round 1', title: 'Microeconomics', meta: '35–40 questions in 2026', kind: 'frontier', topics: ['Supply, demand and equilibrium', 'Elasticity', 'Production and costs', 'Market structures', 'Factor markets', 'Market failure and government'] },
  { round: 'Round 1', title: 'Macroeconomics', meta: '20–25 questions in 2026', kind: 'data', topics: ['GDP and economic growth', 'Inflation and unemployment', 'Aggregate demand and supply', 'Monetary and fiscal policy', 'Exchange rates and trade'] },
  { round: 'Round 2', title: 'The case', meta: 'Team solution + presentation', kind: 'network', topics: ['Reading tables and charts', 'Finding the core problem', 'Weighing trade-offs', 'Making a clear recommendation', 'Presenting and taking questions'] },
] as const;
