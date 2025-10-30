/**
 * Auth Page - Login & First Admin Setup
 * 
 * Pterodactyl-style login with automatic first-user admin setup
 */

import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import '../styles/auth.css';

export const Auth: React.FC = () => {
  const { login, register, requiresSetup, isLoading, error, clearError } = useAuth();
  // If setup is required, start in setup mode. Otherwise start in login mode.
  const [mode, setMode] = useState<'login' | 'setup' | 'forgot'>(() => 
    requiresSetup ? 'setup' : 'login'
  );
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isSetupMode = useMemo(() => requiresSetup && mode === 'setup', [requiresSetup, mode]);
  const isForgotMode = useMemo(() => mode === 'forgot', [mode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError(null);
    setSuccessMessage(null);
    clearError();
  };

  const validateForm = (): boolean => {
    if (isSetupMode) {
      if (!formData.username || !formData.email || !formData.password) {
        setFormError('All fields are required');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 8) {
        setFormError('Password must be at least 8 characters');
        return false;
      }
      if (!formData.email.includes('@')) {
        setFormError('Invalid email address');
        return false;
      }
    } else if (isForgotMode) {
      if (!formData.username) {
        setFormError('Username is required');
        return false;
      }
    } else {
      if (!formData.username || !formData.password) {
        setFormError('Username and password are required');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    if (isSetupMode) {
      const result = await register(formData.username, formData.email, formData.password);
      if (!result.success) {
        setFormError(result.error || 'Registration failed');
      }
    } else if (isForgotMode) {
      try {
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: formData.username }),
        });
        const data = await response.json();
        setSuccessMessage(data.message || 'Password reset instructions have been sent.');
        setFormData({ username: '', email: '', password: '', confirmPassword: '' });
        setTimeout(() => setMode('login'), 3000);
      } catch (err: any) {
        setFormError(err.message || 'Failed to process request');
      }
    } else {
      const result = await login(formData.username, formData.password);
      if (!result.success) {
        setFormError(result.error || 'Login failed');
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <img src="/logo.svg" alt="ArtiPanel Logo" className="auth-logo" />
            <h1>ArtiPanel</h1>
            <p className="auth-subtitle">
              {isSetupMode ? 'Create Admin Account' : isForgotMode ? 'Reset Password' : 'Welcome Back'}
            </p>
          </div>

          {(error || formError) && (
            <div className="auth-error-banner">
              {formError || error}
            </div>
          )}

          {successMessage && (
            <div className="auth-success-banner">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {isSetupMode && (
              <>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="admin@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                name="username"
                placeholder={isForgotMode ? "Enter your username to reset password" : "Enter your username"}
                value={formData.username}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>

            {!isForgotMode && (
              <>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                  {isSetupMode && <PasswordStrengthMeter password={formData.password} />}
                </div>

                {isSetupMode && (
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      id="confirmPassword"
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      required
                    />
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              className="auth-button"
              disabled={isLoading}
            >
              {isLoading ? 'Please wait...' : isSetupMode ? 'Create Admin' : isForgotMode ? 'Send Reset Link' : 'Login'}
            </button>
          </form>

          {!isSetupMode && !isForgotMode && !requiresSetup && (
            <div className="auth-links">
              <button 
                type="button" 
                className="auth-link"
                onClick={() => {
                  setMode('forgot');
                  setFormData({ username: '', email: '', password: '', confirmPassword: '' });
                  setFormError(null);
                  setSuccessMessage(null);
                }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          {isForgotMode && (
            <div className="auth-links">
              <button 
                type="button" 
                className="auth-link"
                onClick={() => {
                  // If setup is required, go back to setup, otherwise go to login
                  setMode(requiresSetup ? 'setup' : 'login');
                  setFormData({ username: '', email: '', password: '', confirmPassword: '' });
                  setFormError(null);
                  setSuccessMessage(null);
                }}
              >
                {requiresSetup ? 'Back to Setup' : 'Back to Login'}
              </button>
            </div>
          )}

          {!isSetupMode && requiresSetup && !isForgotMode && (
            <div className="auth-info">
              <p>System not initialized. Create an admin account first.</p>
            </div>
          )}

          {isSetupMode && (
            <div className="auth-info">
              <p>Set up your admin account to initialize ArtiPanel.</p>
              <p>You'll be able to manage users and settings after login.</p>
            </div>
          )}
        </div>

        <div className="auth-footer">
          <p>ArtiPanel © 2025 • Server Management Panel</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
