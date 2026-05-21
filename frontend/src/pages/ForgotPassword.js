import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import config from '../config/config';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await axios.post(`${config.API_URL}/api/auth/forgot-password`, { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">Forgot Password</h2>
          <p className="auth-subtitle">Enter your email and we'll send you a reset link</p>

          {error && <div className="error-message">{error}</div>}

          {message ? (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #86efac',
              color: '#166534',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center',
              fontSize: '15px',
              marginBottom: '20px'
            }}>
              ✅ {message}
              <br />
              <span style={{ fontSize: '13px', color: '#4b7a5e', marginTop: '8px', display: 'block' }}>
                Check your inbox (and spam folder).
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <p className="auth-footer">
            Remember your password? <Link to="/login" className="auth-link">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;