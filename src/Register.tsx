import { useEffect, useRef, useState, type FormEvent } from 'react';
import { fields, site, upcomingDate } from './content';
import { validateRegistration } from './behavior';
import { Arrow } from './components/Shared';
import { ToastStack, useToasts } from './components/ToastStack';
import { cn } from '@/lib/utils';
import './app.css';

type Field = { name: string; label: string; required?: boolean; type?: string; placeholder?: string; textarea?: boolean };

const registrationFields: { title: string; fields: Field[] }[] = fields;
const teamFields = registrationFields[0].fields.filter(field => field.required);
const contactFields = registrationFields[1].fields.filter(field => field.required);
const optionalFields = registrationFields.flatMap(group => group.fields).filter(field => !field.required);
const steps = ['Your team', 'Contact details'];

/* Origin UI Stepper, ported to a plain ordered list. It only mirrors `step`;
   moving between steps still goes through Continue and its validation. */
function Stepper({ step }: { step: number }) {
  return <ol className="reg-stepper" aria-label="Registration steps">
    {steps.map((label, index) => {
      const state = step > index ? 'complete' : step === index ? 'current' : 'upcoming';
      return <li key={label} className="reg-step" data-state={state} aria-current={step === index ? 'step' : undefined}>
        <span className="reg-step-indicator" aria-hidden="true">
          <span className="reg-step-number">{index + 1}</span>
          <svg className="reg-step-check" viewBox="0 0 16 16" fill="none"><path d="m3.5 8.4 2.9 2.9 6.1-6.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <span className="reg-step-label"><span className="visually-hidden">Step {index + 1} of {steps.length}: </span>{label}{state === 'complete' && <span className="visually-hidden"> (completed)</span>}</span>
        {index < steps.length - 1 && <span className="reg-step-connector" aria-hidden="true"><span /></span>}
      </li>;
    })}
  </ol>;
}

export function Register() {
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availability, setAvailability] = useState<'checking' | 'open' | 'closed' | 'full' | 'unavailable'>('checking');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; id?: string } | null>(null);
  const submission = useRef<{ values: string; id: string } | null>(null);
  const inFlight = useRef(false);
  const status = useRef<HTMLDivElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const pendingFocus = useRef<string | null>(null);
  const availabilityCheck = useRef<AbortController | null>(null);
  const toasts = useToasts();

  const checkAvailability = async () => {
    availabilityCheck.current?.abort();
    const controller = new AbortController();
    availabilityCheck.current = controller;
    setAvailability('checking');
    try {
      const response = await fetch('/api/registration', { cache: 'no-store', signal: controller.signal });
      if (!response.ok) throw new Error('Unavailable');
      const data = await response.json();
      if (typeof data.full !== 'boolean' || typeof data.open !== 'boolean') throw new Error('Invalid status');
      setAvailability(data.full ? 'full' : data.open ? 'open' : 'closed');
    } catch {
      if (!controller.signal.aborted) setAvailability('unavailable');
    }
  };
  useEffect(() => {
    setReady(true);
    void checkAvailability();
    return () => availabilityCheck.current?.abort();
  }, []);
  useEffect(() => { if (result && !Object.keys(errors).length) status.current?.focus(); }, [result, errors]);
  useEffect(() => {
    if (pendingFocus.current) {
      const input = form.current?.querySelector<HTMLElement>(`[name="${pendingFocus.current}"]`);
      input?.closest('details')?.setAttribute('open', '');
      input?.focus();
      pendingFocus.current = null;
    }
  }, [step]);

  const focusError = (nextErrors: Record<string, string>) => {
    const first = Object.keys(nextErrors)[0];
    if (!first) return;
    const targetStep = teamFields.some(field => field.name === first) ? 0 : 1;
    if (targetStep !== step) {
      pendingFocus.current = first;
      setStep(targetStep);
    } else {
      const input = form.current?.querySelector<HTMLElement>(`[name="${first}"]`);
      input?.closest('details')?.setAttribute('open', '');
      input?.focus();
    }
  };
  const move = (nextStep: number) => {
    pendingFocus.current = nextStep === 0 ? 'team' : 'captain';
    setStep(nextStep);
  };
  const continueToContact = () => {
    const allErrors = validateRegistration(values);
    const teamErrors = Object.fromEntries(Object.entries(allErrors).filter(([name]) => teamFields.some(field => field.name === name)));
    setErrors(teamErrors);
    if (Object.keys(teamErrors).length) {
      focusError(teamErrors);
      return;
    }
    move(1);
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current || result?.success) return;
    if (step === 0) { continueToContact(); return; }
    if (availability !== 'open') return;
    const nextErrors = validateRegistration(values);
    setErrors(nextErrors);
    setResult(null);
    if (Object.keys(nextErrors).length) { focusError(nextErrors); return; }
    const serialized = JSON.stringify(values);
    if (submission.current?.values !== serialized) submission.current = { values: serialized, id: crypto.randomUUID() };
    inFlight.current = true;
    setSending(true);
    try {
      const response = await fetch('/api/registration', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values, requestId: submission.current!.id }),
      });
      const data = await response.json();
      if (response.ok && typeof data.id === 'string' && data.id.trim()) {
        setResult({ success: true, message: 'Your team is registered.', id: data.id });
        toasts.push({ kind: 'success', title: 'Team registered', body: `Reference ${data.id}` });
      } else {
        if (data.code === 'full') setAvailability('full');
        if (data.code === 'closed') setAvailability('closed');
        if (data.errors) { setErrors(data.errors); focusError(data.errors); }
        setResult({ success: false, message: data.message || 'Registration could not be completed. Please try again.' });
      }
    } catch {
      setResult({ success: false, message: 'We could not confirm your registration. Retry with the same details; your team will not be registered twice.' });
    } finally {
      inFlight.current = false;
      setSending(false);
    }
  };
  const change = (name: string, value: string) => {
    setValues(previous => ({ ...previous, [name]: value }));
    setResult(null);
    if (errors[name]) setErrors(previous => { const next = { ...previous }; delete next[name]; return next; });
  };
  /* Bencho Label Input, ported: a real <label> that rests inside the empty
     field and lifts onto its top edge on focus or once filled (pure CSS via
     :placeholder-shown, so the prerendered HTML looks the same). */
  const field = (raw: Field) => {
    const error = errors[raw.name];
    const shared = {
      id: raw.name, name: raw.name, value: values[raw.name] || '', className: 'reg-control',
      placeholder: raw.placeholder || ' ', required: raw.required, 'aria-invalid': !!error,
      'aria-describedby': error ? `${raw.name}-error` : undefined,
    };
    return <div className={cn('reg-field', (raw.textarea || raw.name.startsWith('m') || raw.name === 'captain' || raw.name === 'email') && 'full-width')} data-textarea={raw.textarea || undefined} key={raw.name}>
      <div className="reg-box">
        {raw.textarea
          ? <textarea {...shared} rows={3} onChange={event => change(raw.name, event.target.value)} />
          : <input {...shared} type={raw.type || 'text'} autoComplete={raw.name === 'email' ? 'email' : raw.name === 'phone' ? 'tel' : raw.name === 'country' ? 'country-name' : raw.name === 'captain' ? 'name' : raw.name === 'school' ? 'organization' : 'off'} autoCapitalize={raw.name === 'email' ? 'none' : /^(m\d|captain|team|school|country)$/.test(raw.name) ? 'words' : undefined} autoCorrect={raw.name === 'email' ? 'off' : undefined} spellCheck={raw.name === 'email' ? false : undefined} enterKeyHint="next" onChange={event => change(raw.name, event.target.value)} />}
        <label htmlFor={raw.name} className="reg-label">{raw.label}{raw.required && <span className="reg-required" aria-hidden="true">*</span>}</label>
      </div>
      {error && <p className="field-error" id={`${raw.name}-error`}>{error}</p>}
    </div>;
  };
  const notices = {
    checking: 'Checking registration availability...',
    open: 'Registration is open. Places are limited to 33 teams.',
    closed: `Registration is not open yet. The next edition takes place on ${upcomingDate}.`,
    full: 'Capacity reached. Registration is closed.',
    unavailable: 'Registration is temporarily unavailable. Please try again later.',
  };
  const submitLabel = sending ? 'Registering...' : availability === 'full' ? 'Capacity reached' : availability === 'closed' ? 'Registration not open' : availability === 'checking' ? 'Checking availability...' : availability === 'unavailable' ? 'Registration unavailable' : 'Register your team';

  return <main id="main" className="register-main container">
    <a href="/" className="text-link back-link"><Arrow />Back to the challenge</a>
    <div className="registration-layout">
      <div className="registration-intro">
        <h1>Register<br /> your team.</h1>
        <p>For teams of three high school students.</p>
        <p className="register-contact"><a href={`mailto:${site.email}`}>Questions? Email the organisers<Arrow diagonal /></a></p>
      </div>
      <div className="registration-form">
        <div className="registration-notice" role="status"><p>{notices[availability]}</p>{availability === 'unavailable' && <button className="text-link" type="button" onClick={() => void checkAvailability()}>Check again</button>}</div>
        <form ref={form} onSubmit={submit} noValidate hidden={result?.success} aria-label="Team registration">
          <Stepper step={step} />
          <fieldset hidden={step !== 0} disabled={sending || result?.success}>
            <legend>Your team</legend>
            <div className="form-fields">{teamFields.map(field)}</div>
          </fieldset>
          <fieldset hidden={step !== 1} disabled={sending || result?.success}>
            <legend>Contact details</legend>
            <p className="contact-hint">One captain and email address for the whole team.</p>
            <div className="team-review"><div><strong>{values.team}</strong><p>{values.school}</p><p>{['m1', 'm2', 'm3'].map(name => values[name]).filter(Boolean).join(', ')}</p></div><button type="button" className="text-link" onClick={() => move(0)}>Edit team</button></div>
            <div className="form-fields">{contactFields.map(field)}</div>
            <details className="optional-fields"><summary>Additional details <span>Optional</span><span className="disclosure-icon" aria-hidden="true" /></summary><div className="form-fields">{optionalFields.map(field)}</div></details>
            <div className="reg-consent">
              <input type="checkbox" id="consent" name="consent" checked={values.consent === 'yes'} required aria-invalid={!!errors.consent} aria-describedby={errors.consent ? 'consent-error' : undefined} onChange={event => change('consent', event.target.checked ? 'yes' : '')} />
              <label htmlFor="consent">I have read the <a href="/privacy" target="_blank" rel="noreferrer">privacy notice</a>, and my teammates know their details are being shared with the organisers.</label>
            </div>
            {errors.consent && <p className="field-error" id="consent-error">{errors.consent}</p>}
          </fieldset>
          <noscript><p>Registration needs JavaScript. Please contact the organising team with questions.</p></noscript>
          <div className="form-actions">
            {step === 1 && <button type="button" className="text-link form-back" onClick={() => move(0)} disabled={sending}><Arrow />Back</button>}
            <button className="button" type="submit" onClick={event => { if (step === 0) { event.preventDefault(); continueToContact(); } }} disabled={!ready || (step === 1 && (availability !== 'open' || sending))}>{step === 0 ? 'Continue' : submitLabel}<Arrow /></button>
          </div>
          {step === 1 && <p className="form-note">Your team is registered only after confirmation appears.</p>}
        </form>
        <div ref={status} className="preview-result" tabIndex={-1} role="status" hidden={!result}>{result && <><h2>{result.success ? "You're registered." : 'Registration update'}</h2>{!result.success && <p>{result.message}</p>}{result.id && <p>Registration reference: {result.id}</p>}<p>Questions? Contact <a href={`mailto:${site.email}`}>{site.email}</a>.</p></>}</div>
      </div>
    </div>
    <ToastStack {...toasts} />
  </main>;
}
