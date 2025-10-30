/**
 * Servers Page
 *
 * Manage and monitor game/application servers
 */

import React, { useState } from 'react';
import { z } from 'zod';
import { useValidatedList, useValidatedMutation } from '../../hooks/useValidatedApi';
import { ServerSchema, Validator, formatZodError } from '../../utils/validation';
import { ErrorDisplay, LoadingSkeleton } from '../ErrorBoundary';

interface ServersPageProps {
  mode?: 'list' | 'create';
}

const Servers: React.FC<ServersPageProps> = ({ mode = 'list' }) => {
  const { data: listResponse, loading, error, refetch } = useValidatedList(
    '/servers',
    ServerSchema,
    { refetchInterval: 45000 }
  );

  const { execute: createServer, loading: creating, error: createError } =
    useValidatedMutation('POST', ServerSchema);

  const [showCreateForm, setShowCreateForm] = useState(mode === 'create');
  const [newServer, setNewServer] = useState({
    name: '',
    host: '',
    port: '25565',
    username: '',
    password: '',
    nodeId: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  const resetForm = () => {
    setNewServer({
      name: '',
      host: '',
      port: '25565',
      username: '',
      password: '',
      nodeId: '',
    });
    setFormErrors({});
  };

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormErrors({});
    setFeedback(null);

    const portValue = Number(newServer.port);
    if (!Number.isInteger(portValue) || portValue < 1 || portValue > 65535) {
      setFormErrors({ port: 'Port must be between 1 and 65535.' });
      return;
    }

    const payload = {
      name: newServer.name.trim(),
      host: newServer.host.trim(),
      port: portValue,
      username: newServer.username.trim() || undefined,
      password: newServer.password.trim() || undefined,
      nodeId: newServer.nodeId.trim() || undefined,
    };

    try {
      Validator.validateServerCreate(payload);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const formatted = formatZodError(validationError);
        const nextErrors: Record<string, string> = {};
        Object.entries(formatted).forEach(([path, messages]) => {
          if (messages.length > 0) {
            nextErrors[path] = messages[0];
          }
        });
        setFormErrors(nextErrors);
      } else {
        setFormErrors({ global: 'Unable to validate server details.' });
      }
      return;
    }

    const result = await createServer('/servers', payload);
    if (!result) {
      return;
    }

    resetForm();
    await refetch();
    setFeedback('Server queued for provisioning. Connection details saved.');

    if (mode !== 'create') {
      setShowCreateForm(false);
    }
  };

  const handleCancel = () => {
    if (mode === 'create') {
      resetForm();
      return;
    }

    resetForm();
    setShowCreateForm(false);
    setFeedback(null);
  };

  const servers = (listResponse as any)?.data || [];
  const isShowingForm = mode === 'create' || showCreateForm;
  const inlineError = (path: string) => formErrors[path] ?? null;

  return (
    <div className="page-container">
      <style>{`
        .page-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          background-color: var(--color-background);
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
        }

        .page-title {
          font-size: 32px;
          font-weight: 700;
          color: var(--color-text);
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .btn {
          padding: 10px 20px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
          font-size: 14px;
        }

        .btn-primary {
          background-color: var(--color-primary);
          color: white;
        }

        .btn-primary:hover {
          background-color: var(--color-secondary);
        }

        .btn-secondary {
          background-color: var(--color-surface);
          color: var(--color-text);
          border: 1px solid var(--color-border);
        }

        .btn-secondary:hover {
          background-color: var(--color-surface-alt);
        }

        .empty-state {
          text-align: center;
          padding: 60px 24px;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--color-text);
          margin-bottom: 8px;
        }

        .empty-text {
          color: var(--color-text-secondary);
          margin-bottom: 24px;
        }

        .success-banner {
          padding: 12px 16px;
          border-radius: 6px;
          background-color: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.4);
          color: var(--color-success);
          margin-bottom: 16px;
          font-size: 14px;
        }

        .error-banner {
          padding: 12px 16px;
          border-radius: 6px;
          background-color: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: var(--color-error);
          margin-bottom: 16px;
          font-size: 14px;
        }

        .form-error {
          font-size: 12px;
          color: var(--color-error);
        }

        .servers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .server-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .server-card:hover {
          border-color: var(--color-primary);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        .server-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-text);
          margin-bottom: 8px;
        }

        .server-status {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          background-color: var(--color-success);
          color: white;
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 16px;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .servers-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {isShowingForm ? (
        <>
          <div className="page-header">
            <h1 className="page-title">Create Server</h1>
          </div>
          {feedback && <div className="success-banner">{feedback}</div>}
          {formErrors.global && <div className="error-banner">{formErrors.global}</div>}
          {createError && <ErrorDisplay error={createError} onDismiss={() => {}} />}
          <div style={{ background: 'var(--color-surface)', padding: '24px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              Provide server connection details. Provisioning will continue in the background.
            </p>
            <form style={{ display: 'grid', gap: '16px', maxWidth: '500px' }} onSubmit={handleCreateSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' }}>Server Name</label>
                <input
                  type="text"
                  placeholder="e.g., Survival-01"
                  value={newServer.name}
                  onChange={(event) => setNewServer((prev) => ({ ...prev, name: event.target.value }))}
                  style={{ padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}
                />
                {inlineError('name') && <span className="form-error">{inlineError('name')}</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' }}>Host Address</label>
                <input
                  type="text"
                  placeholder="203.0.113.10"
                  value={newServer.host}
                  onChange={(event) => setNewServer((prev) => ({ ...prev, host: event.target.value }))}
                  style={{ padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}
                />
                {inlineError('host') && <span className="form-error">{inlineError('host')}</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' }}>Game Port</label>
                <input
                  type="number"
                  placeholder="25565"
                  value={newServer.port}
                  min={1}
                  max={65535}
                  onChange={(event) => setNewServer((prev) => ({ ...prev, port: event.target.value }))}
                  style={{ padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}
                />
                {inlineError('port') && <span className="form-error">{inlineError('port')}</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' }}>SSH Username (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., ubuntu"
                  value={newServer.username}
                  onChange={(event) => setNewServer((prev) => ({ ...prev, username: event.target.value }))}
                  style={{ padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' }}>SSH Password (optional)</label>
                <input
                  type="password"
                  placeholder="Optional for key-based auth"
                  value={newServer.password}
                  onChange={(event) => setNewServer((prev) => ({ ...prev, password: event.target.value }))}
                  style={{ padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' }}>Assign Node (optional)</label>
                <input
                  type="text"
                  placeholder="edge-1"
                  value={newServer.nodeId}
                  onChange={(event) => setNewServer((prev) => ({ ...prev, nodeId: event.target.value }))}
                  style={{ padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}
                />
                {inlineError('nodeId') && <span className="form-error">{inlineError('nodeId')}</span>}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Server'}
                </button>
                {mode !== 'create' && (
                  <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </>
      ) : (
        <>
          <div className="page-header">
            <h1 className="page-title">Servers</h1>
            <div className="header-actions">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setFeedback(null);
                  setFormErrors({});
                  resetForm();
                  setShowCreateForm(true);
                }}
              >
                Create Server
              </button>
              <button className="btn btn-secondary" onClick={() => refetch()}>Refresh</button>
            </div>
          </div>

          {feedback && <div className="success-banner">{feedback}</div>}
          {error && <ErrorDisplay error={error} onDismiss={() => {}} />}

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : servers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">[S]</div>
              <h2 className="empty-title">No Servers Yet</h2>
              <p className="empty-text">Create your first server to get started.</p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setFeedback(null);
                  setFormErrors({});
                  resetForm();
                  setShowCreateForm(true);
                }}
              >
                Create Server
              </button>
            </div>
          ) : (
            <div className="servers-grid">
              {servers.map((server: any) => (
                <div key={server.id ?? server.name} className="server-card">
                  <div className="server-name">{server.name}</div>
                  <div className="server-status">{server.status || 'Online'}</div>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '12px' }}>
                    Host: {server.host}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Servers;
