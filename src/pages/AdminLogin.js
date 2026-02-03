import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './AdminLogin.css';
import API_BASE_URL from '../config';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store token in localStorage
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUsername', data.username);
        toast.success('Login successful!');
        navigate('/admin/dashboard');
      } else {
        toast.error(data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <div className="admin-login-header">
          <h1>🔐 Admin Login</h1>
          <p>CV Generator Admin Portal</p>
        </div>
        
        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="default-credentials">
          <p><strong>⚠️ Default Credentials:</strong></p>
          <p>Username: <code>admin</code></p>
          <p>Password: <code>admin123</code></p>
          <small>Please change after first login!</small>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
