/**
 * Servers Management Page
 * Display and manage all servers
 */

import React, { useState } from 'react';
import { useServers, useDeleteServer, useServerControl } from '../hooks/useApi';

const Servers: React.FC = () => {
  const { data: servers, loading, error, refetch } = useServers();
  const { deleteServer } = useDeleteServer(() => refetch());
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (loading) {
    return (
      <div className="servers-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading servers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="servers-page">
        <div className="error">
          <p>Error loading servers: {error.message}</p>
          <button onClick={() => refetch()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="servers-page">
      <div className="page-header">
        <h1>🖥️ Servers</h1>
        <button
          className="btn-primary"
          onClick={() => setShowCreateForm(true)}
          title="Ctrl+N"
        >
          ➕ New Server
        </button>
      </div>

      {showCreateForm && (
        <div className="create-form-panel">
          <h2>Create New Server</h2>
          <form className="server-form">
            <div className="form-group">
              <label>Server Name</label>
              <input type="text" placeholder="Enter server name" />
            </div>

            <div className="form-group">
              <label>Image</label>
              <select>
                <option>Ubuntu 22.04</option>
                <option>Debian 11</option>
                <option>CentOS 8</option>
                <option>AlmaLinux 9</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>CPU Cores</label>
                <input type="number" min="1" defaultValue="2" />
              </div>

              <div className="form-group">
                <label>Memory (MB)</label>
                <input type="number" min="512" defaultValue="2048" />
              </div>

              <div className="form-group">
                <label>Disk (MB)</label>
                <input type="number" min="10240" defaultValue="51200" />
              </div>
            </div>

            <div className="form-group">
              <label>Node</label>
              <select>
                <option>Select a node...</option>
                <option>Node 1 (US)</option>
                <option>Node 2 (EU)</option>
                <option>Node 3 (AS)</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Create Server
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="servers-grid">
        {servers && Array.isArray(servers) && servers.length > 0 ? (
          servers.map((server: any) => (
            <div
              key={server.id}
              className={`server-card ${server.status}`}
              onClick={() => setSelectedServerId(server.id)}
            >
              <div className="card-header">
                <h3>{server.name}</h3>
                <span className={`status-badge ${server.status}`}>
                  {server.status.toUpperCase()}
                </span>
              </div>

              <div className="card-info">
                <div className="info-row">
                  <span className="label">Type:</span>
                  <span className="value">{server.type}</span>
                </div>
                <div className="info-row">
                  <span className="label">Image:</span>
                  <span className="value">{server.image}</span>
                </div>
                <div className="info-row">
                  <span className="label">CPU:</span>
                  <span className="value">{server.cpu} cores</span>
                </div>
                <div className="info-row">
                  <span className="label">Memory:</span>
                  <span className="value">{server.memory}MB</span>
                </div>
                <div className="info-row">
                  <span className="label">Disk:</span>
                  <span className="value">{server.disk}MB</span>
                </div>
              </div>

              <div className="card-actions">
                {server.status === 'running' ? (
                  <>
                    <button className="btn-small btn-warning">⏸️ Stop</button>
                    <button className="btn-small btn-info">🔄 Restart</button>
                  </>
                ) : (
                  <button className="btn-small btn-success">▶️ Start</button>
                )}
                <button
                  className="btn-small btn-danger"
                  onClick={() => {
                    if (window.confirm(`Delete server "${server.name}"?`)) {
                      deleteServer(server.id);
                    }
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No servers found</p>
            <button
              className="btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              Create First Server
            </button>
          </div>
        )}
      </div>

      {selectedServerId && (
        <div className="server-detail-panel">
          <div className="detail-header">
            <h2>Server Details</h2>
            <button onClick={() => setSelectedServerId(null)}>✕</button>
          </div>

          <div className="detail-content">
            <div className="detail-section">
              <h3>Server Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">ID:</span>
                  <span className="value">{selectedServerId}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Created:</span>
                  <span className="value">2024-10-15</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Network</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Primary IP:</span>
                  <span className="value">192.168.1.100</span>
                </div>
                <div className="detail-item">
                  <span className="label">Ports:</span>
                  <span className="value">22, 80, 443</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Advanced</h3>
              <div className="btn-group">
                <button className="btn-secondary">📊 View Stats</button>
                <button className="btn-secondary">📁 File Manager</button>
                <button className="btn-secondary">💻 Console</button>
                <button className="btn-secondary">🔄 Reinstall</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .servers-page {
          padding: 20px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .page-header h1 {
          font-size: 28px;
          color: var(--color-text);
          margin: 0;
        }

        .servers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .server-card {
          background: var(--color-surface);
          border-radius: 8px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .server-card:hover {
          border-color: var(--color-primary);
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .card-header h3 {
          margin: 0;
          color: var(--color-text);
          font-size: 16px;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge.running {
          background: var(--color-success);
          color: white;
        }

        .status-badge.stopped {
          background: var(--color-error);
          color: white;
        }

        .card-info {
          margin-bottom: 12px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 13px;
          color: var(--color-text-secondary);
        }

        .info-row .label {
          font-weight: 600;
        }

        .info-row .value {
          color: var(--color-text);
        }

        .card-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .btn-small {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
          flex: 1;
          min-width: 80px;
        }

        .btn-success {
          background: var(--color-success);
          color: white;
        }

        .btn-warning {
          background: var(--color-warning);
          color: white;
        }

        .btn-danger {
          background: var(--color-error);
          color: white;
        }

        .btn-small:hover {
          opacity: 0.8;
        }

        .create-form-panel {
          background: var(--color-surface);
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 24px;
          border-left: 4px solid var(--color-primary);
        }

        .server-form {
          display: grid;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-weight: 600;
          margin-bottom: 6px;
          color: var(--color-text);
        }

        .form-group input,
        .form-group select {
          padding: 10px;
          border: 1px solid var(--color-border);
          border-radius: 4px;
          background: var(--color-background);
          color: var(--color-text);
          font-size: 14px;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        .form-actions button {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: var(--color-primary);
          color: white;
        }

        .btn-secondary {
          background: var(--color-surface);
          color: var(--color-text);
          border: 1px solid var(--color-border);
        }

        .server-detail-panel {
          position: fixed;
          right: 0;
          top: 0;
          width: 350px;
          height: 100vh;
          background: var(--color-surface);
          border-left: 1px solid var(--color-border);
          overflow-y: auto;
          z-index: 100;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid var(--color-border);
          position: sticky;
          top: 0;
          background: var(--color-surface);
        }

        .detail-content {
          padding: 20px;
        }

        .detail-section {
          margin-bottom: 24px;
        }

        .detail-section h3 {
          margin: 0 0 12px 0;
          color: var(--color-primary);
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .detail-grid {
          display: grid;
          gap: 12px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 13px;
        }

        .loading,
        .error {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }
      `}</style>
    </div>
  );
};

export default Servers;
