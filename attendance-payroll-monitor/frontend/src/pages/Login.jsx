import React, { useState } from 'react';
import axios from 'axios';
import { Activity, Lock, Mail, AlertCircle } from 'lucide-react';

export default function Login({ setAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setAuth(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoIcon}>
            <Activity size={32} color="#ffffff" />
          </div>
          <h1 style={styles.title}>Welcome to AttendPay</h1>
          <p style={styles.subtitle}>Sign in to manage your workforce</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Enter Email</label>
            <div style={styles.inputWrapper}>
              <Mail style={styles.inputIcon} size={18} />
              <input
                type="email"
                placeholder="Enter Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock style={styles.inputIcon} size={18} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at top left, #1a1c2e, #0f101a)',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 1000,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: 'rgba(28, 30, 48, 0.8)',
    backdropFilter: 'blur(12px)',
    borderRadius: 24,
    padding: '48px 40px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  header: {
    textAlign: 'center',
    marginBottom: 32,
  },
  logoIcon: {
    width: 64,
    height: 64,
    background: 'linear-gradient(135deg, #6c63ff, #4a42d4)',
    borderRadius: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 0 24px rgba(108, 99, 255, 0.3)',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: 14,
    color: '#a0a3c0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: '#d1d5db',
    marginLeft: 4,
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    color: '#6b7280',
  },
  input: {
    width: '100%',
    background: 'rgba(17, 24, 39, 0.4)',
    border: '1px solid rgba(108, 99, 255, 0.2)',
    borderRadius: 12,
    padding: '14px 14px 14px 46px',
    color: '#ffffff',
    fontSize: 15,
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  submitBtn: {
    marginTop: 12,
    background: 'linear-gradient(135deg, #6c63ff, #5a52e0)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 12,
    padding: '14px',
    fontSize: 16,
    fontWeight: 600,
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(108, 99, 255, 0.2)',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    padding: '12px 16px',
    borderRadius: 10,
    color: '#fca5a5',
    fontSize: 13,
    marginBottom: 24,
  }
};
