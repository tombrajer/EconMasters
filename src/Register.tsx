import { useEffect, useRef, useState, type FormEvent } from 'react';
import { fields, site } from './content';
import { validateRegistration } from './behavior';
import { Arrow, EligibilityList } from './components/Shared';

type Field = { name: string; label: string; required?: boolean; type?: string; placeholder?: string; textarea?: boolean };

export function Register() {
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [availability, setAvailability] = useState<'checking' | 'open' | 'closed' | 'full' | 'unavailable'>('checking');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; id?: string } | null>(null);
  const submission = useRef<{ values: string; id: string } | null>(null);
  const inFlight = useRef(false);
  const status = useRef<HTMLDivElement>(null);
  const checkAvailability = async (signal?: AbortSignal) => {
    setAvailability('checking');
    try {
      const response = await fetch('/api/registration', { cache: 'no-store', signal });
      if (!response.ok) throw new Error('Unavailable');
      const data = await response.json();
      if (typeof data.full !== 'boolean' || typeof data.open !== 'boolean') throw new Error('Invalid status');
      setAvailability(data.full ? 'full' : data.open ? 'open' : 'closed');
    } catch {
      if (!signal?.aborted) setAvailability('unavailable');
    }
  };
  useEffect(() => {
    const controller = new AbortController();
    void checkAvailability(controller.signal);
    return () => controller.abort();
  }, []);
  useEffect(() => { if (result) status.current?.focus(); }, [result]);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current || availability !== 'open' || result?.success) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(Array.from(new FormData(form).entries()).map(([key,value]) => [key,String(value)]));
    const nextErrors = validateRegistration(values);
    setErrors(nextErrors);
    setResult(null);
    const first = Object.keys(nextErrors)[0];
    if (first) {
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
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
      if (response.ok && typeof data.id === 'string') {
        setResult({ success: true, message: 'Your team is registered.', id: data.id });
      } else {
        if (data.code === 'full') setAvailability('full');
        if (data.code === 'closed') setAvailability('closed');
        if (data.errors) {
          setErrors(data.errors);
          const name = Object.keys(data.errors)[0];
          form.querySelector<HTMLElement>(`[name="${name}"]`)?.focus();
        }
        setResult({ success: false, message: data.message || 'Registration could not be completed. Please try again.' });
      }
    } catch {
      setResult({ success: false, message: 'We could not confirm your registration. Please retry with the same details; your team will not be registered twice.' });
    } finally {
      inFlight.current = false;
      setSending(false);
    }
  };
  const clear = (name: string) => {
    setResult(null);
    if (errors[name]) setErrors(previous => { const next = {...previous}; delete next[name]; return next; });
  };
  const notices = {
    checking: 'Checking registration availability…',
    open: 'Exactly three students per team. Limited to 33 teams (99 participants).',
    closed: 'Registration is not open yet.',
    full: 'Capacity reached. Registration is closed.',
    unavailable: 'Registration is temporarily unavailable. Please try again later.',
  };
  return <main id="main" className="register-main container"><a href="/" className="text-link back-link"><Arrow />Back to the challenge</a><div className="registration-layout"><div className="registration-intro"><h1>Three minds.<br /><em>One team.</em></h1><p className="register-lead">Your next challenge starts together.</p><p>Register a team of exactly three students. Places are limited to 33 teams.</p><EligibilityList /><p className="register-contact">Questions about taking part?<br /><a href={`mailto:${site.email}`}>{site.email}</a></p></div><div className="registration-form"><div className="preview-notice"><span className="preview-symbol" aria-hidden="true">3</span><div role="status"><strong>Team registration</strong><p>{notices[availability]}</p>{availability === 'unavailable' && <button className="text-link" type="button" onClick={() => void checkAvailability()}>Check again</button>}</div></div><form onSubmit={submit} noValidate>
      <p className="required-note">Fields marked <span>*</span> are required.</p>
      {fields.map((group,index) => <fieldset key={group.title} disabled={sending || result?.success}><legend><span>{String(index+1).padStart(2,'0')}</span>{' '}{group.title}</legend><div className="form-fields">{group.fields.map((raw: Field) => <div className={`form-field ${raw.textarea ? 'full-width' : ''}`} key={raw.name}><label htmlFor={raw.name}>{raw.label}{raw.required && <span aria-hidden="true"> *</span>}</label>{raw.textarea ? <textarea id={raw.name} name={raw.name} rows={3} onChange={() => clear(raw.name)} /> : <input id={raw.name} name={raw.name} type={raw.type || 'text'} required={raw.required} placeholder={raw.placeholder} autoComplete={raw.name === 'email' ? 'email' : raw.name === 'phone' ? 'tel' : raw.name === 'country' ? 'country-name' : 'off'} aria-invalid={!!errors[raw.name]} aria-describedby={errors[raw.name] ? `${raw.name}-error` : undefined} onChange={() => clear(raw.name)} />}{errors[raw.name] && <p className="field-error" id={`${raw.name}-error`}>{errors[raw.name]}</p>}</div>)}</div></fieldset>)}
      <noscript><p>Registration needs JavaScript. No registration can be sent from this page. Please contact the organising team with questions.</p></noscript>
      <button className="button" type="submit" disabled={availability !== 'open' || sending || result?.success}>{sending ? 'Registering…' : availability === 'full' ? 'Capacity reached' : 'Register your team'}<Arrow /></button><p className="form-note">Your team is registered only after confirmation appears below.</p>
      <div ref={status} className="preview-result" tabIndex={-1} role="status" hidden={!result}>{result && <><h2>{result.success ? 'You’re registered.' : 'Registration update'}</h2><p>{result.message}</p>{result.id && <p>Registration reference: {result.id}</p>}<p>Questions? Contact <a href={`mailto:${site.email}`}>{site.email}</a>.</p></>}</div>
    </form></div></div></main>;
}
