import React, { useState } from 'react';
import api, { TOKEN_KEY } from '../utils/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await api.post('/admin-auth/login', { email: email.trim(), password });
      localStorage.setItem(TOKEN_KEY, res.data.token);
      onLogin();
    } catch (err) {
      if (err.response?.status === 429) setError('Too many attempts. Try again in a few minutes.');
      else if (err.response?.data?.message) setError(err.response.data.message);
      else setError('Cannot reach the server. Check your internet and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <form onSubmit={submit} style={styles.card}>
        <h1 style={styles.logo}>اُستاد</h1>
        <p style={styles.sub}>Admin sign in</p>
        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div style={styles.error}>{error}</div>}
        <button style={{ ...styles.btn, opacity: busy ? 0.6 : 1 }} disabled={busy} type="submit">
          {busy ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f8f9fa', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', padding: 16,
  },
  card: {
    backgroundColor: '#1a1a2e', borderRadius: 16, padding: 32, width: '100%', maxWidth: 360,
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  logo: { color: '#fff', fontSize: 36, margin: 0, textAlign: 'center' },
  sub: { color: '#9b93ff', margin: '0 0 8px', textAlign: 'center', fontSize: 14 },
  input: {
    padding: '12px 14px', borderRadius: 8, border: '1px solid #3a3a5c',
    backgroundColor: '#fff', fontSize: 15,
  },
  error: {
    backgroundColor: '#ef444420', color: '#fca5a5', padding: '10px 12px', borderRadius: 8, fontSize: 13,
  },
  btn: {
    backgroundColor: '#6353f7', color: '#fff', border: 'none', padding: 12,
    borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer',
  },
};
