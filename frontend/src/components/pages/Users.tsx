/**
 * Users Management Page
 * 
 * Admin panel for managing user accounts, roles, and permissions
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/users.css';

interface UserData {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  createdAt: string;
  lastLogin: string | null;
  isActive: boolean;
}

export const Users: React.FC = () => {
  const { accessToken, user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserData | null>(null);
  const [resetPasswordForm, setResetPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user' | 'viewer',
  });

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!accessToken) return;

      try {
        const response = await fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        if (!response.ok) throw new Error('Failed to load users');
        const data = await response.json();
        setUsers(data.users);
      } catch (err: any) {
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [accessToken]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!accessToken) return;

    if (newUser.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to create user');

      setUsers([...users, data.user]);
      setNewUser({ username: '', email: '', password: '', role: 'user' });
      setShowCreateForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!accessToken) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error('Failed to update role');
      const data = await response.json();

      setUsers(users.map((u) => (u.id === userId ? data.user : u)));
    } catch (err: any) {
      setError(err.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!accessToken) return;
    if (!confirm('Are you sure? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error('Failed to delete user');

      setUsers(users.filter((u) => u.id !== userId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!accessToken || !resetPasswordUser) return;

    if (resetPasswordForm.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          username: resetPasswordUser.username,
          newPassword: resetPasswordForm.newPassword,
        }),
      });

      if (!response.ok) throw new Error('Failed to reset password');

      setResetPasswordUser(null);
      setResetPasswordForm({ newPassword: '', confirmPassword: '' });
      alert(`Password for ${resetPasswordUser.username} has been reset successfully.`);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="page-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>Only admins can manage users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="users-header">
        <h1>User Management</h1>
        <button
          className="btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {resetPasswordUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Reset Password for {resetPasswordUser.username}</h2>
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={resetPasswordForm.newPassword}
                  onChange={(e) =>
                    setResetPasswordForm({
                      ...resetPasswordForm,
                      newPassword: e.target.value,
                    })
                  }
                  minLength={8}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={resetPasswordForm.confirmPassword}
                  onChange={(e) =>
                    setResetPasswordForm({
                      ...resetPasswordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  minLength={8}
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setResetPasswordUser(null);
                    setResetPasswordForm({ newPassword: '', confirmPassword: '' });
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}

      {showCreateForm && (
        <div className="create-user-form">
          <h2>Create New User</h2>
          <form onSubmit={handleCreateUser}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={newUser.username}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                minLength={8}
                required
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    role: e.target.value as 'admin' | 'user' | 'viewer',
                  })
                }
              >
                <option value="viewer">Viewer</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn-primary">
              Create User
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <p>No users found</p>
        </div>
      ) : (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={u.id === currentUser?.id}
                    >
                      <option value="viewer">Viewer</option>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    {u.lastLogin
                      ? new Date(u.lastLogin).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-reset"
                        onClick={() => setResetPasswordUser(u)}
                        title="Reset user password"
                      >
                        Reset Password
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={u.id === currentUser?.id}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;
