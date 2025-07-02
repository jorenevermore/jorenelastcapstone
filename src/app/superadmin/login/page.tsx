'use client';

import { useState } from 'react';

export default function SuperAdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/superadmin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Generate session token and expiry
        const sessionToken = btoa(`${email}:${Date.now()}:${Math.random()}`);
        const sessionExpiry = Date.now() + (3600000); // 1 hour from now

        // Store authentication data
        localStorage.setItem('superadmin_token', sessionToken);
        localStorage.setItem('superadmin_session_expiry', sessionExpiry.toString());

        // Also set cookie for middleware detection
        document.cookie = `superadmin_token=${sessionToken}; path=/; max-age=${3600}`; // 1 hour

        // Force a full page redirect to ensure proper state update
        window.location.href = '/superadmin';
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('SuperAdmin login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '50px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <div style={{ maxWidth: '400px', margin: '0 auto', backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>SuperAdmin Login</h1>

        {error && (
          <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ffcdd2' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px' }}
              placeholder="admin@alot.com"
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px' }}
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#666' : '#000',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Authenticating...' : 'Login to SuperAdmin'}
          </button>
        </form>


      </div>
    </div>
  );
}