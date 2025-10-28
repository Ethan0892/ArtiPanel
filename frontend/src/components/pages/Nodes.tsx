/**
 * Nodes Management Page
 * Display and manage distributed game server nodes
 */

import React, { useState } from 'react';
import { useNodes } from '../hooks/useApi';

const Nodes: React.FC = () => {
  const { data: nodes, loading, error, refetch } = useNodes();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (loading) {
    return (
      <div className="nodes-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading nodes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nodes-page">
        <div className="error">
          <p>Error loading nodes: {error.message}</p>
          <button onClick={() => refetch()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="nodes-page">
      <div className="page-header">
        <h1>🌐 Nodes</h1>
        <button
          className="btn-primary"
          onClick={() => setShowCreateForm(true)}
          title="Ctrl+D"
        >
          ➕ Add Node
        </button>
      </div>

      {showCreateForm && (
        <div className="create-form-panel">
          <h2>Add New Node</h2>
          <form className="node-form">
            <div className="form-row">
              <div className="form-group">
                <label>Node Name</label>
                <input type="text" placeholder="e.g., US-Node-01" />
              </div>

              <div className="form-group">
                <label>Location</label>
                <select>
                  <option>United States (NY)</option>
                  <option>Europe (DE)</option>
                  <option>Asia (SG)</option>
                  <option>Australia (SY)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>FQDN / Hostname</label>
              <input type="text" placeholder="node1.example.com" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Scheme</label>
                <select>
                  <option>https</option>
                  <option>http</option>
                </select>
              </div>

              <div className="form-group">
                <label>Port</label>
                <input type="number" defaultValue="8080" />
              </div>
            </div>

            <div className="form-group">
              <label>API Key</label>
              <input
                type="password"
                placeholder="Paste your Pterodactyl API key"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Total Memory (MB)</label>
                <input type="number" defaultValue="32768" />
              </div>

              <div className="form-group">
                <label>Memory Overallocate (%)</label>
                <input type="number" defaultValue="0" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Total Disk (MB)</label>
                <input type="number" defaultValue="1048576" />
              </div>

              <div className="form-group">
                <label>Disk Overallocate (%)</label>
                <input type="number" defaultValue="0" />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Add Node
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

      <div className="nodes-grid">
        {nodes && Array.isArray(nodes) && nodes.length > 0 ? (
          nodes.map((node: any) => (
            <div
              key={node.id}
              className={`node-card ${node.status}`}
              onClick={() => setSelectedNodeId(node.id)}
            >
              <div className="card-header">
                <h3>{node.name}</h3>
                <span className={`status-indicator ${node.status}`}></span>
              </div>

              <div className="card-meta">
                <p className="location">📍 {node.location}</p>
                <p className="fqdn">{node.fqdn}</p>
              </div>

              <div className="card-stats">
                <div className="stat">
                  <span className="stat-label">Memory</span>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: '65%' }}
                    ></div>
                  </div>
                  <span className="stat-value">20.5GB / 32GB</span>
                </div>

                <div className="stat">
                  <span className="stat-label">Disk</span>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: '42%' }}
                    ></div>
                  </div>
                  <span className="stat-value">440GB / 1TB</span>
                </div>

                <div className="stat">
                  <span className="stat-label">Servers</span>
                  <span className="stat-value">12 / 100</span>
                </div>
              </div>

              <div className="card-actions">
                <button className="btn-small">👁️ View</button>
                <button className="btn-small">✏️ Edit</button>
                <button className="btn-small btn-danger">🗑️ Remove</button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No nodes configured</p>
            <button
              className="btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              Add Your First Node
            </button>
          </div>
        )}
      </div>

      {selectedNodeId && (
        <div className="node-detail-panel">
          <div className="detail-header">
            <h2>Node Details</h2>
            <button onClick={() => setSelectedNodeId(null)}>✕</button>
          </div>

          <div className="detail-content">
            <div className="detail-section">
              <h3>Node Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Status:</span>
                  <span className="value">🟢 Online</span>
                </div>
                <div className="detail-item">
                  <span className="label">Uptime:</span>
                  <span className="value">45 days 12h</span>
                </div>
                <div className="detail-item">
                  <span className="label">Last Check:</span>
                  <span className="value">2 minutes ago</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Resource Allocation</h3>
              <div className="detail-item full">
                <span className="label">Memory</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '65%' }}></div>
                </div>
                <span className="stat-value">20.5GB / 32GB (65%)</span>
              </div>

              <div className="detail-item full">
                <span className="label">Disk</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '42%' }}></div>
                </div>
                <span className="stat-value">440GB / 1TB (42%)</span>
              </div>
            </div>

            <div className="detail-section">
              <h3>Allocations</h3>
              <div className="allocations-list">
                <div className="allocation-item">
                  <span className="port">25565</span>
                  <span className="status">assigned</span>
                </div>
                <div className="allocation-item">
                  <span className="port">25566</span>
                  <span className="status">available</span>
                </div>
                <div className="allocation-item">
                  <span className="port">25567</span>
                  <span className="status">available</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Actions</h3>
              <div className="btn-group">
                <button className="btn-secondary">🔍 Test Connection</button>
                <button className="btn-secondary">⚙️ Configure</button>
                <button className="btn-danger">🔄 Reboot Node</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .nodes-page {
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

        .nodes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .node-card {
          background: var(--color-surface);
          border-radius: 8px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .node-card:hover {
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

        .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .status-indicator.online {
          background: var(--color-success);
        }

        .status-indicator.offline {
          background: var(--color-error);
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .card-meta {
          margin-bottom: 16px;
        }

        .card-meta p {
          margin: 4px 0;
          font-size: 13px;
          color: var(--color-text-secondary);
        }

        .card-stats {
          margin-bottom: 16px;
          padding: 12px 0;
          border-top: 1px solid var(--color-border);
          border-bottom: 1px solid var(--color-border);
        }

        .stat {
          margin-bottom: 12px;
        }

        .stat-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-text-secondary);
        }

        .progress-bar {
          height: 6px;
          background: var(--color-background);
          border-radius: 3px;
          margin: 4px 0;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
          transition: width 0.3s ease;
        }

        .stat-value {
          font-size: 12px;
          color: var(--color-text);
          font-weight: 500;
        }

        .card-actions {
          display: flex;
          gap: 8px;
        }

        .btn-small {
          flex: 1;
          padding: 8px;
          border: none;
          border-radius: 4px;
          background: var(--color-background);
          color: var(--color-text);
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
          border: 1px solid var(--color-border);
        }

        .btn-small:hover {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }

        .btn-danger {
          background: var(--color-error);
          color: white;
          border-color: var(--color-error);
        }

        .create-form-panel {
          background: var(--color-surface);
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 24px;
          border-left: 4px solid var(--color-primary);
        }

        .node-form {
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

        .node-detail-panel {
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

        .detail-item.full {
          flex-direction: column;
        }

        .allocations-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .allocation-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: var(--color-background);
          border-radius: 4px;
          font-size: 12px;
        }

        .allocation-item .port {
          font-weight: 600;
          color: var(--color-primary);
        }

        .allocation-item .status {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 2px;
        }

        .allocation-item .status.assigned {
          background: var(--color-error);
          color: white;
        }

        .allocation-item .status.available {
          background: var(--color-success);
          color: white;
        }

        .btn-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .btn-group button {
          padding: 10px;
          border: 1px solid var(--color-border);
          background: var(--color-background);
          color: var(--color-text);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-group button:hover {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
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

export default Nodes;
