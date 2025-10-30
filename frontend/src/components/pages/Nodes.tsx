/**
 * Nodes Page
 * 
 * Manage and monitor compute nodes
 */

import React, { useState } from 'react';
import { z } from 'zod';
import { useValidatedList, useValidatedMutation } from '../../hooks/useValidatedApi';
import { NodeSchema, Validator, formatZodError } from '../../utils/validation';
import { ErrorDisplay, LoadingSkeleton } from '../ErrorBoundary';

interface NodesPageProps {
  mode?: 'list' | 'add';
}

const Nodes: React.FC<NodesPageProps> = ({ mode = 'list' }) => {
  const { data: listResponse, loading, error, refetch } = useValidatedList(
    '/nodes',
    NodeSchema,
    { refetchInterval: 60000 }
  );

  const { execute: createNode, loading: creating, error: createError } =
    useValidatedMutation('POST', NodeSchema);

  const [showAddForm, setShowAddForm] = useState(mode === 'add');
  const [newNode, setNewNode] = useState({
    name: '',
    host: '',
    port: '22',
    username: '',
    publicKey: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  const resetForm = () => {
    setNewNode({
      name: '',
      host: '',
      port: '22',
      username: '',
      publicKey: '',
    });
    setFormErrors({});
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormErrors({});
    setFeedback(null);

    const portValue = Number(newNode.port);
    if (!Number.isInteger(portValue) || portValue < 1 || portValue > 65535) {
      setFormErrors({ port: 'Port must be between 1 and 65535.' });
      return;
    }

    const payload = {
      name: newNode.name.trim(),
      host: newNode.host.trim(),
      port: portValue,
      username: newNode.username.trim() || undefined,
      publicKey: newNode.publicKey.trim() || undefined,
    };

    try {
      Validator.validateNodeCreate(payload);
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
        setFormErrors({ global: 'Unable to validate node details.' });
      }
      return;
    }

    const result = await createNode('/nodes', payload);
    if (!result) {
      return;
    }

    resetForm();
    await refetch();
    setFeedback('Node created successfully. Credentials saved for provisioning.');

    if (mode !== 'add') {
      setShowAddForm(false);
    }
  };

  const handleCancel = () => {
    if (mode === 'add') {
      resetForm();
      return;
    }
    resetForm();
    setShowAddForm(false);
  };

  const nodes = (listResponse as any)?.data || [];
  const isShowingForm = mode === 'add' || showAddForm;
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

        .nodes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .node-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .node-card:hover {
          border-color: var(--color-primary);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        .node-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-text);
          margin-bottom: 8px;
        }

        .node-status {
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

          .nodes-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {isShowingForm ? (
        <>
          <div className="page-header">
            <h1 className="page-title">Add Node</h1>
          </div>
          {feedback && <div className="success-banner">{feedback}</div>}
          {formErrors.global && <div className="error-banner">{formErrors.global}</div>}
          {createError && <ErrorDisplay error={createError} onDismiss={() => {}} />}
          <div style={{ background: 'var(--color-surface)', padding: '24px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              Configure and connect a new compute node to the panel.
            </p>
            <form style={{ display: 'grid', gap: '16px', maxWidth: '500px' }} onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' }}>Node Name</label>
                <input
                  type="text"
                  placeholder="e.g., Node-1"
                  value={newNode.name}
                  onChange={(e) => setNewNode({ ...newNode, name: e.target.value })}
                  style={{ padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}
                />
                {inlineError('name') && <span className="form-error">{inlineError('name')}</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' }}>Host Address</label>
                <input
                  type="text"
                  placeholder="192.168.1.100"
                  value={newNode.host}
                  onChange={(e) => setNewNode({ ...newNode, host: e.target.value })}
                  style={{ padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}
                />
                {inlineError('host') && <span className="form-error">{inlineError('host')}</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' }}>SSH Port</label>
                <input
                  type="number"
                  placeholder="22"
                  value={newNode.port}
                  onChange={(e) => setNewNode({ ...newNode, port: e.target.value })}
                  style={{ padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}
                  min={1}
                  max={65535}
                />
                {inlineError('port') && <span className="form-error">{inlineError('port')}</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' }}>Username (optional)</label>
                <input
                  type="text"
                  placeholder="root"
                  value={newNode.username}
                  onChange={(e) => setNewNode({ ...newNode, username: e.target.value })}
                  style={{ padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' }}>Public SSH Key (optional)</label>
                <textarea
                  placeholder="ssh-ed25519 AAAA..."
                  value={newNode.publicKey}
                  onChange={(e) => setNewNode({ ...newNode, publicKey: e.target.value })}
                  style={{ padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: 'var(--color-background)', color: 'var(--color-text)', minHeight: '120px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" disabled={creating} style={{ padding: '10px 20px', backgroundColor: creating ? '#ccc' : 'var(--color-primary)' }}>
                  {creating ? 'Adding...' : 'Add Node'}
                </button>
                {mode !== 'add' && (
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
            <h1 className="page-title">Nodes</h1>
            <div className="header-actions">
              <button className="btn btn-primary" onClick={() => {
                setFeedback(null);
                setFormErrors({});
                resetForm();
                setShowAddForm(true);
              }}>
                Add Node
              </button>
              <button className="btn btn-secondary" onClick={() => refetch()}>Refresh</button>
            </div>
          </div>

          {feedback && <div className="success-banner">{feedback}</div>}
          {error && <ErrorDisplay error={error} onDismiss={() => {}} />}

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : nodes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">[N]</div>
              <h2 className="empty-title">No Nodes Yet</h2>
              <p className="empty-text">Add a node to get started</p>
              <button className="btn btn-primary" onClick={() => {
                setFeedback(null);
                setFormErrors({});
                resetForm();
                setShowAddForm(true);
              }}>
                Add Node
              </button>
            </div>
          ) : (
            <div className="nodes-grid">
              {nodes.map((node: any) => (
                <div key={node.id} className="node-card">
                  <div className="node-name">{node.name}</div>
                  <div className="node-status">{node.status || 'Online'}</div>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '12px' }}>
                    Host: {node.host}
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

export default Nodes;
