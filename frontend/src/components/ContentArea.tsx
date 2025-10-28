/**
 * Main Content Area Component
 * 
 * Displays dashboard widgets and content
 */

import React, { useState } from 'react';

const ContentArea: React.FC = () => {
  const [stats] = useState({
    servers: 12,
    nodes: 3,
    uptime: '99.9%',
    bandwidth: '2.4TB/month',
  });

  const recentActivity = [
    { id: 1, type: 'server_created', message: 'Created Survival Server', time: '5m ago' },
    { id: 2, type: 'node_online', message: 'Node US-West came online', time: '1h ago' },
    { id: 3, type: 'backup_completed', message: 'Weekly backup completed', time: '3h ago' },
  ];

  return (
    <div className="content-area">
      <style jsx>{`
        .content-area {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          background-color: var(--color-background);
        }

        .content-header {
          margin-bottom: 24px;
        }

        .page-title {
          font-size: 28px;
          font-weight: 600;
          color: var(--color-text);
          margin-bottom: 8px;
        }

        .page-subtitle {
          font-size: 14px;
          color: var(--color-text-secondary);
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          border-color: var(--color-primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .stat-label {
          font-size: 12px;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 600;
          color: var(--color-text);
          margin-bottom: 8px;
        }

        .stat-change {
          font-size: 12px;
          color: var(--color-success);
        }

        .section {
          margin-bottom: 24px;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-text);
        }

        .section-action {
          background: none;
          border: none;
          color: var(--color-primary);
          cursor: pointer;
          font-size: 13px;
          text-decoration: none;
        }

        .section-action:hover {
          text-decoration: underline;
        }

        .activity-list {
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          overflow: hidden;
        }

        .activity-item {
          padding: 16px;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.2s ease;
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-item:hover {
          background-color: var(--color-surface-alt);
        }

        .activity-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .activity-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .activity-message {
          font-size: 13px;
          color: var(--color-text);
          font-weight: 500;
        }

        .activity-time {
          font-size: 12px;
          color: var(--color-text-secondary);
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }

        .action-button {
          background-color: var(--color-primary);
          color: white;
          border: none;
          padding: 12px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .action-button:hover {
          background-color: var(--color-secondary);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .keyboard-hint {
          display: inline-block;
          font-size: 11px;
          background-color: var(--color-surface-alt);
          color: var(--color-text-secondary);
          padding: 2px 6px;
          border-radius: 3px;
          margin-left: 8px;
        }

        @media (max-width: 768px) {
          .content-area {
            padding: 16px;
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .page-title {
            font-size: 20px;
          }
        }
      `}</style>

      <div className="content-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here's your server overview.</p>
      </div>

      {/* Statistics Cards */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-label">🖥️ Active Servers</div>
          <div className="stat-value">{stats.servers}</div>
          <div className="stat-change">↑ 2 from last week</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">🌐 Nodes Online</div>
          <div className="stat-value">{stats.nodes}/3</div>
          <div className="stat-change">All operational</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">⚡ Uptime</div>
          <div className="stat-value">{stats.uptime}</div>
          <div className="stat-change">0 incidents this month</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">📊 Bandwidth</div>
          <div className="stat-value">2.4TB</div>
          <div className="stat-change">↓ 12% from last month</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Quick Actions</h2>
        </div>
        <div className="quick-actions">
          <button className="action-button">
            ➕ New Server
            <span className="keyboard-hint">Ctrl+N</span>
          </button>
          <button className="action-button">
            🎮 Deploy Game
            <span className="keyboard-hint">Ctrl+G</span>
          </button>
          <button className="action-button">
            🔗 Add Node
            <span className="keyboard-hint">Ctrl+D</span>
          </button>
          <button className="action-button">
            📋 File Manager
            <span className="keyboard-hint">Ctrl+M</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Recent Activity</h2>
          <button className="section-action">View All</button>
        </div>
        <div className="activity-list">
          {recentActivity.map(activity => (
            <div key={activity.id} className="activity-item">
              <div className="activity-content">
                <div className="activity-icon">
                  {activity.type === 'server_created' && '✨'}
                  {activity.type === 'node_online' && '🌐'}
                  {activity.type === 'backup_completed' && '💾'}
                </div>
                <div className="activity-text">
                  <div className="activity-message">{activity.message}</div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentArea;
