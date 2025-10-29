/**
 * Servers Page
 * 
 * Manage and monitor game/application servers
 */

import React, { useState } from 'react';
import { useValidatedList, useValidatedMutation } from '../../hooks/useValidatedApi';
import { ServerSchema } from '../../utils/validation';
import { ErrorDisplay, LoadingSkeleton } from '../ErrorBoundary';

interface ServersPageProps {
  mode?: 'list' | 'create';
}

const Servers: React.FC<ServersPageProps> = ({ mode = 'list' }) => {
  const { data: listResponse, loading, error, refetch } = useValidatedList(
    '/servers',
    ServerSchema,
    { refetchInterval: 30000 }
  );

  const { execute: createServer, loading: creating, error: createError } =
    useValidatedMutation('POST', ServerSchema);

  const [showCreateForm, setShowCreateForm] = useState(mode === 'create');
  const [createError2, setCreateError2] = useState<Error | null>(null);
  const [newServer, setNewServer] = useState({
    name: '',
    host: '',
    port: 3000,
    username: '',
    password: '',
  });

  const servers = listResponse?.data || [];

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

      {mode === 'create' ? (
        <>
          <div className="page-header">
            <h1 className="page-title">Create Server</h1>
          </div>
          {createError && <ErrorDisplay error={createError} onDismiss={() => setCreateError2(null)} />}
          <div style={{ background: 'var(--color-surface)', padding: '24px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              Server creation form and configuration will be implemented here.
            </p>
            <form style={{ display: 'grid', gap: '16px', maxWidth: '500px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' }}>Server Name</label>
                <input type="text" placeholder="e.g., Game Server 1" style={{ padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' }}>Node</label>
                <select style={{ padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}>
                  <option>Select a node</option>
                </select>
              </div>
              <button type="button" className="btn btn-primary" disabled={creating}>
                {creating ? 'Creating...' : 'Create Server'}
              </button>
            </form>
          </div>
        </>
      ) : (
        <>
          <div className="page-header">
            <h1 className="page-title">Servers</h1>
            <div className="header-actions">
              <button className="btn btn-primary">Create Server</button>
              <button className="btn btn-secondary" onClick={() => refetch()}>Refresh</button>
            </div>
          </div>

          {error && <ErrorDisplay error={error} onDismiss={() => setCreateError2(null)} />}

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : servers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">[S]</div>
              <h2 className="empty-title">No Servers Yet</h2>
              <p className="empty-text">Create your first server to get started</p>
              <button className="btn btn-primary">Create Server</button>
            </div>
          ) : (
            <div className="servers-grid">
              {servers.map((server: any) => (
                <div key={server.id} className="server-card">
                  <div className="server-name">{server.name}</div>
                  <div className="server-status">Online</div>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '12px' }}>
                    Node: {server.node}
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
