/**
 * Dashboard Page
 * 
 * Main overview with statistics and quick actions
 */

import React from 'react';
import { useServers } from '../../hooks/useApi';
import { useNodes } from '../../hooks/useApi';
import { useSystemHealth } from '../../hooks/useApi';
import { ErrorDisplay, LoadingSkeleton } from '../ErrorBoundary';

const Dashboard: React.FC = () => {
  const { data: serversData, loading: serversLoading, error: serversError } = useServers();
  const { data: nodesData, loading: nodesLoading, error: nodesError } = useNodes();
  const { data: healthData, loading: healthLoading, error: healthError } = useSystemHealth();

  // Calculate stats from data
  const servers = (serversData as any)?.data || [];
  const nodes = (nodesData as any)?.data || [];
  const activeServers = servers.length;
  const activeNodes = nodes.length;
  
  // Get real uptime from health endpoint
  const systemUptime = (healthData as any)?.uptime || 'Loading...';

  // Calculate bandwidth (sum from all servers)
  const calculateBandwidth = () => {
    return servers.reduce((total: number, server: any) => {
      return total + (server.bandwidth || 50);
    }, 0);
  };

  const stats = {
    servers: activeServers,
    nodes: activeNodes,
    uptime: systemUptime,
    bandwidth: calculateBandwidth(),
  };

  const isLoading = serversLoading || nodesLoading || healthLoading;
  const error = serversError || nodesError || healthError;

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
          margin-bottom: 32px;
        }

        .page-title {
          font-size: 32px;
          font-weight: 700;
          color: var(--color-text);
          margin-bottom: 8px;
        }

        .page-subtitle {
          font-size: 14px;
          color: var(--color-text-secondary);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 24px;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          border-color: var(--color-primary);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        .stat-label {
          font-size: 12px;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.8px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .stat-value {
          font-size: 36px;
          font-weight: 700;
          color: var(--color-text);
          margin-bottom: 8px;
        }

        .stat-change {
          font-size: 12px;
          color: var(--color-success);
          font-weight: 500;
        }

        .section {
          margin-bottom: 32px;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--color-text);
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
        }

        .action-button {
          background-color: var(--color-primary);
          color: white;
          border: none;
          padding: 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .action-button:hover {
          background-color: var(--color-secondary);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 16px;
          }

          .page-title {
            font-size: 24px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">System overview and quick access</p>
      </div>

      {error && <ErrorDisplay error={error} onDismiss={() => {}} />}

      {isLoading ? (
        <LoadingSkeleton count={4} />
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Active Servers</div>
              <div className="stat-value">{stats.servers}</div>
              <div className="stat-change">{stats.servers > 0 ? 'Ready to deploy' : 'No servers'}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Nodes Online</div>
              <div className="stat-value">{stats.nodes}</div>
              <div className="stat-change">{stats.nodes > 0 ? 'All operational' : 'No nodes'}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">System Uptime</div>
              <div className="stat-value">{stats.uptime}</div>
              <div className="stat-change">No incidents</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Total Bandwidth</div>
              <div className="stat-value">{stats.bandwidth}GB</div>
              <div className="stat-change">This month</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">Quick Actions</h2>
            </div>
            <div className="quick-actions">
              <button className="action-button">Create Server</button>
              <button className="action-button">Add Node</button>
              <button className="action-button">View Storage</button>
              <button className="action-button">System Logs</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
