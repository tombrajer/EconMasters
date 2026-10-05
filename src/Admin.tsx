import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { AdminRegistration } from '../server/admin-store';

type Loaded = { registrations: AdminRegistration[]; capacity: number };

export function Admin() {
  const [code, setCode] = useState('');
  const [data, setData] = useState<Loaded | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);

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
      else setMessage(body.message || 'Unavailable. Try again later.');
      setCode('');
    } catch {
      setMessage('Unavailable. Try again later.');
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
  const exportExcel = async () => (await import('./xlsx')).downloadXlsx(data!.registrations);

  const deleteRegistration = async (entry: AdminRegistration) => {
    if (inFlight.current || !window.confirm(`Delete registration for “${entry.team}”? This cannot be undone.`)) return;
    inFlight.current = true;
    setDeleting(entry.id);
    setMessage('');
    try {
      const response = await fetch('/api/admin', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' }, cache: 'no-store',
        body: JSON.stringify({ passcode: code, id: entry.id }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || body.deleted !== entry.id) throw new Error(body.message || 'Could not delete registration. Try again.');
      await unlockAfterDelete();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not delete registration. Try again.');
    } finally {
      inFlight.current = false;
      setDeleting(null);
    }
  };
  const unlockAfterDelete = async () => {
    const response = await fetch('/api/admin', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store',
      body: JSON.stringify({ passcode: code }),
    });
    const body = await response.json();
    if (!response.ok || !Array.isArray(body.registrations)) throw new Error('Registration deleted. Reload to refresh the list.');
    setData(body);
  };

  if (!data) return <main id="main" className="admin-main container">
    <form className="admin-lock" onSubmit={submit} aria-label="Admin">
      <label htmlFor="passcode">Admin</label>
      <input ref={input} id="passcode" name="passcode" type="password" inputMode="numeric" pattern="[0-9]*" maxLength={4} autoComplete="off" autoCapitalize="none" autoCorrect="off" enterKeyHint="go" placeholder="••••" value={code} disabled={busy} aria-describedby="passcode-message" onChange={event => change(event.target.value)} />
      <p id="passcode-message" role="status">{message}</p>
    </form>
  </main>;

  const { registrations, capacity } = data;
  return <main id="main" className="admin-main container">
    <div className="admin-bar">
      <h1>{registrations.length}<span> / {capacity} teams</span></h1>
      <div>
        <button type="button" className="button" onClick={() => void exportExcel()} disabled={!registrations.length}>Export Excel</button>
        <button type="button" className="text-link" onClick={lock} disabled={deleting !== null}>Lock</button>
      </div>
    </div>
    <p role="status" className="admin-message">{message}</p>
    {registrations.length === 0 ? <p className="admin-empty">No registrations yet.</p> : <div className="admin-table" role="region" aria-label="Registrations" tabIndex={0}>
      <table>
        <thead><tr><th scope="col">#</th><th scope="col">Team</th><th scope="col">School</th><th scope="col">Members</th><th scope="col">Captain</th><th scope="col">Email</th><th scope="col">Registered</th><th scope="col" className="admin-actions">Actions</th></tr></thead>
        <tbody>{registrations.map(entry => <tr key={entry.id}>
          <td>{entry.slot}</td><th scope="row">{entry.team}</th><td>{entry.school}</td><td>{entry.members.join(', ')}</td><td>{entry.captain}</td>
          <td><a href={`mailto:${entry.email}`}>{entry.email}</a></td><td><time dateTime={entry.createdAt}>{entry.createdAt.slice(0, 10)}</time></td>
          <td className="admin-actions"><button type="button" className="admin-delete" aria-label={`Delete ${entry.team}`} disabled={deleting !== null} onClick={() => void deleteRegistration(entry)}>{deleting === entry.id ? 'Deleting…' : 'Delete'}</button></td>
        </tr>)}</tbody>
      </table>
    </div>}
  </main>;
}

function lockTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return 'a while';
  if (seconds < 90) return 'a minute';
  if (seconds < 5400) return `${Math.round(seconds / 60)} minutes`;
  return `${Math.round(seconds / 3600)} hours`;
}
