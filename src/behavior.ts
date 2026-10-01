export function graphProgress(top: number, height: number, viewport: number, reducedMotion = false): number {
  if (reducedMotion) return 1;
  return Math.max(0, Math.min(1, (viewport * 0.85 - top) / (height + viewport * 0.65)));
}

export function economicProgress(top: number, height: number, viewport: number, reducedMotion = false): number {
  if (reducedMotion) return 1;
  const center = top + height / 2;
  return Math.max(0, Math.min(1, (viewport * .6 - center) / (viewport * .6)));
}

export function validateRegistration(values: Record<string, string>): Record<string, string> {
  const required: Record<string, string> = {
    team: 'team name', school: 'school', m1: 'team member 1',
    m2: 'team member 2', m3: 'team member 3', captain: 'team captain', email: 'email address',
  };
  const errors: Record<string, string> = {};
  for (const [name, label] of Object.entries(required)) {
    if (!values[name]?.trim()) errors[name] = `Please enter your ${label}.`;
  }
  const members = ['m1', 'm2', 'm3'];
  members.forEach((name, index) => {
    const member = values[name]?.trim().toLocaleLowerCase();
    if (member && members.slice(0, index).some(previous => values[previous]?.trim().toLocaleLowerCase() === member)) {
      errors[name] = 'Please enter a different student for each team member.';
    }
  });
  if (values.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }
  return errors;
}
