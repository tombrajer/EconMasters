import { useEffect, useRef, useState, type FormEvent } from 'react';
import { fields, site } from './content';
import { validateRegistration } from './behavior';
import { Arrow, EligibilityList } from './components/Shared';

type Field = { name: string; label: string; required?: boolean; type?: string; placeholder?: string; textarea?: boolean };

export function Register() {
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [previewed, setPreviewed] = useState(false);
  const [ready, setReady] = useState(false);
  const status = useRef<HTMLDivElement>(null);
  useEffect(() => { setReady(true); }, []);
  useEffect(() => { if (previewed) status.current?.focus(); }, [previewed]);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(Array.from(new FormData(form).entries()).map(([key,value]) => [key,String(value)]));
    const nextErrors = validateRegistration(values);
    setErrors(nextErrors);
    setPreviewed(false);
    const first = Object.keys(nextErrors)[0];
    if (first) form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
    else setPreviewed(true);
  };
  const clear = (name: string) => {
    setPreviewed(false);
    if (errors[name]) setErrors(previous => { const next = {...previous}; delete next[name]; return next; });
  };
  return <main id="main" className="register-main container"><a href="/" className="text-link back-link"><Arrow />Back to the challenge</a><div className="registration-layout"><div className="registration-intro"><h1>Three minds.<br /><em>One team.</em></h1><p className="register-lead">Your next challenge starts together.</p><p>Next-edition registration dates are to be announced. Explore the team form below.</p><EligibilityList /><p className="register-contact">Questions about taking part?<br /><a href={`mailto:${site.email}`}>{site.email}</a></p></div><div className="registration-form"><div className="preview-notice"><span className="preview-symbol" aria-hidden="true">P</span><div><strong>Registration form preview</strong><p>This form is a preview. Your details stay on this page and are never sent or saved.</p></div></div><form onSubmit={submit} noValidate onChange={() => { if (previewed) setPreviewed(false); }}>
      <p className="required-note">Fields marked <span>*</span> are required.</p>
      {fields.map((group,index) => <fieldset key={group.title}><legend><span>{String(index+1).padStart(2,'0')}</span>{' '}{group.title}</legend><div className="form-fields">{group.fields.map((raw: Field) => <div className={`form-field ${raw.textarea ? 'full-width' : ''}`} key={raw.name}><label htmlFor={raw.name}>{raw.label}{raw.required && <span aria-hidden="true"> *</span>}</label>{raw.textarea ? <textarea id={raw.name} name={raw.name} rows={3} onChange={() => clear(raw.name)} /> : <input id={raw.name} name={raw.name} type={raw.type || 'text'} required={raw.required} placeholder={raw.placeholder} autoComplete={raw.name === 'email' ? 'email' : raw.name === 'phone' ? 'tel' : raw.name === 'country' ? 'country-name' : 'off'} aria-invalid={!!errors[raw.name]} aria-describedby={errors[raw.name] ? `${raw.name}-error` : undefined} onChange={() => clear(raw.name)} />}{errors[raw.name] && <p className="field-error" id={`${raw.name}-error`}>{errors[raw.name]}</p>}</div>)}</div></fieldset>)}
      <noscript><p>The form preview needs JavaScript. No registration can be sent from this page. Please contact the organising team with questions.</p></noscript>
      <button className="button" type="submit" disabled={!ready}>Preview your entry<Arrow /></button><p className="form-note">Preview only · No registration will be submitted.</p>
      <div ref={status} className="preview-result" tabIndex={-1} role="status" hidden={!previewed}><h2>Your preview is complete.</h2><p>The required fields look complete. Nothing was sent or saved, and your team has not been registered.</p><p>Contact <a href={`mailto:${site.email}`}>{site.email}</a> for registration updates.</p></div>
    </form></div></div></main>;
}
