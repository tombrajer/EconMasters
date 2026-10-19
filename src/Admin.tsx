import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { AdminRegistration } from '../server/admin-store';
import { ToastStack, useToasts } from './components/ToastStack';
import './app.css';

type Loaded = { registrations: AdminRegistration[]; capacity: number };

export function Admin() {
  const [code, setCode] = useState('');
  const [data, setData] = useState<Loaded | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);
  const toasts = useToasts();

  const unlock = async (passcode: string) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store',
        body: JSON.stringify({ passcode }),
      });
      const body = await response.json().catch(() => ({}));
      if (response.ok && Array.isArray(body.registrations)) { setData(body); return; }
      if (response.status === 401) setMessage(body.attemptsLeft === 1 ? 'Incorrect. One attempt left.' : 'Incorrect passcode.');
      else if (response.status === 429) setMessage(`Locked. Try again in ${lockTime(Number(body.retryAfter))}.`);
      else {
        setMessage(body.message || 'Unavailable. Try again later.');
        toasts.push({ kind: 'error', title: 'Registrations could not be loaded', body: 'The server did not answer. Try again later.' });
      }
      setCode('');
    } catch {
      setMessage('Unavailable. Try again later.');
      toasts.push({ kind: 'error', title: 'Registrations could not be loaded', body: 'Check the connection and try again.' });
      setCode('');
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  useEffect(() => { if (!busy && !data) input.current?.focus(); }, [busy, data]);

  const change = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setCode(digits);
    if (message) setMessage('');
    if (digits.length === 4) void unlock(digits);
  };
  const submit = (event: FormEvent) => { event.preventDefault(); if (code.length === 4) void unlock(code); };
  const lock = () => { setData(null); setCode(''); setMessage(''); };
  const exportExcel = async () => {
    if (!data || exporting) return;
    setExporting(true);
    try {
      (await import('./xlsx')).downloadXlsx(data.registrations);
      const count = data.registrations.length;
      toasts.push({ kind: 'success', title: 'Excel exported', body: `${count} ${count === 1 ? 'team' : 'teams'} saved to your downloads.` });
    } catch {
      toasts.push({ kind: 'error', title: 'Export failed', body: 'The spreadsheet could not be created. Try again.' });
    } finally {
      setExporting(false);
    }
  };

  return <main id="main" className="admin-main container">
    {data ? <Registrations data={data} exporting={exporting} onExport={() => void exportExcel()} onLock={lock} /> : <form className="admin-pin" onSubmit={submit} aria-label="Admin">
      <label htmlFor="passcode">Admin</label>
      <div className="admin-pin-field" data-busy={busy || undefined}>
        <input ref={input} id="passcode" name="passcode" type="password" inputMode="numeric" pattern="[0-9]*" maxLength={4} autoComplete="off" autoCapitalize="none" autoCorrect="off" enterKeyHint="go" placeholder="••••" value={code} disabled={busy} aria-describedby="passcode-message" onChange={event => change(event.target.value)} />
        <span className="admin-pin-meter" aria-hidden="true">{[0, 1, 2, 3].map(index => <span key={index} data-on={code.length > index || undefined} />)}</span>
      </div>
      <p id="passcode-message" role="status">{message}</p>
    </form>}
    <ToastStack {...toasts} />
  </main>;
}

/* shadcn Table, ported to plain semantic markup with the site's own rules. */
function Registrations({ data, exporting, onExport, onLock }: { data: Loaded; exporting: boolean; onExport: () => void; onLock: () => void }) {
  const { registrations, capacity } = data;
  return <>
    <div className="admin-bar">
      <div>
        <p className="admin-kicker">Registrations</p>
        <h1>{registrations.length}<span> / {capacity} teams</span></h1>
      </div>
      <div className="admin-actions">
        <button type="button" className="button" onClick={onExport} disabled={!registrations.length || exporting}>{exporting ? 'Exporting...' : 'Export Excel'}</button>
        <button type="button" className="text-link admin-lock-button" onClick={onLock}>Lock</button>
      </div>
    </div>
    {registrations.length === 0
      ? <div className="admin-empty"><h2>No teams yet.</h2><p>Registrations appear here as soon as the first team signs up. Capacity is {capacity} teams.</p></div>
      : <div className="admin-table" role="region" aria-label="Registrations" tabIndex={0}>
        <table>
          <caption className="visually-hidden">Registered teams, {registrations.length} of {capacity}</caption>
          <thead><tr><th scope="col" className="numeric">#</th><th scope="col">Team</th><th scope="col">School</th><th scope="col">Members</th><th scope="col">Captain</th><th scope="col">Email</th><th scope="col" className="numeric">Registered</th></tr></thead>
          <tbody>{registrations.map(entry => <tr key={entry.id}>
            <td className="numeric">{entry.slot}</td><th scope="row">{entry.team}</th><td>{entry.school}</td><td>{entry.members.join(', ')}</td><td>{entry.captain}</td>
            <td className="admin-email"><a href={`mailto:${entry.email}`}>{entry.email}</a></td><td className="numeric"><time dateTime={entry.createdAt}>{entry.createdAt.slice(0, 10)}</time></td>
          </tr>)}</tbody>
        </table>
      </div>}
  </>;
}

function lockTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return 'a while';
  if (seconds < 90) return 'a minute';
  if (seconds < 5400) return `${Math.round(seconds / 60)} minutes`;
  return `${Math.round(seconds / 3600)} hours`;
}
