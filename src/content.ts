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
  ['Team size', '3 students'],
  ['Academic programs', 'AP / IB / other'],
  ['Next edition', 'To be announced'],
  ['Registration deadline', 'To be announced'],
];
export const partners = [
  { name: 'Visa', href: 'https://www.visa.cz/' },
  { name: 'Bankovnictví', href: 'https://bankovnictvionline.cz/' },
  { name: 'EAAPS', href: 'https://www.eaaps.eu/' },
];
export const schedule = [
  ['08:00', 'Arrival & registration'], ['08:30', 'Opening'],
  ['Round 1', 'Analytical Foundations'], ['Break', 'Lunch & networking'],
  ['Round 2', 'Case Challenge'], ['—', 'Judging'],
  ['—', 'Final results'], ['16:00', 'Closing'],
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

export const academicRows = [
  { title: 'Apply economics', label: 'Economic trade-offs', kind: 'frontier', body: 'Move beyond textbook theory. Connect economic concepts to real-world decisions.' },
  { title: 'Follow the evidence', label: 'Economic indicators', kind: 'data', body: 'Interpret data. Reason through uncertainty. Solve unfamiliar problems under pressure.' },
  { title: 'Think together', label: 'Connected thinking', kind: 'network', body: 'Build a solution as a team. Meet students, educators, academics, and professionals.' },
] as const;
