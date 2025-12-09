import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const success = login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid email or password');
    }
  };

  const demoCredentials = [
    { role: 'Super Admin', email: 'superadmin@gmail.com' },
    { role: 'Project Admin', email: 'projectadmin@gmail.com' },
    { role: 'Sales User', email: 'salesuser@gmail.com' },
    { role: 'Viewer', email: 'viewer@gmail.com' },
    { role: 'Customer', email: 'customer@gmail.com' }
  ];

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Smart Slot</h1>
          <p>Please login to continue</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        <div className="demo-credentials">
          <h3>Demo Credentials</h3>
          <div className="credentials-list">
            {demoCredentials.map((cred) => (
              <div key={cred.email} className="credential-item">
                <span className="role">{cred.role}</span>
                <span className="email">{cred.email}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '12px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
            Password is the role name (e.g., "superadmin", "projectadmin")
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
