import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import "../styles/AdminLogin.css";

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();
    if (login(password)) {
      navigate('/admin/dashboard');
    } else {
      setError('Wrong password!');
    }
  }

  return (
    <div className="admin-login-page">
      <div className="login-card">
        <h2 className="login-title">Staff Access</h2>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={function(e) { setPassword(e.target.value); }}
            className="login-input"
            required
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-btn">Login</button>
        </form>
      </div>
    </div>
  );
}
