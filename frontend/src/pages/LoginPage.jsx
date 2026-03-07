import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';

export function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    try {
      await apiFetch('/.netlify/functions/login', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      navigate('/dashboard');
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-lg parchment-panel">
      <h1 className="font-cinzel text-3xl text-royal">Order Entry</h1>
      <label className="mt-4 block text-sm font-semibold">Email</label>
      <input className="mt-1 w-full rounded border p-2" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
      <label className="mt-4 block text-sm font-semibold">Password</label>
      <input className="mt-1 w-full rounded border p-2" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <button className="mt-6 rounded bg-royal px-4 py-2 font-semibold text-parchment hover:bg-slate-700" type="submit">Sign In</button>
    </form>
  );
}
