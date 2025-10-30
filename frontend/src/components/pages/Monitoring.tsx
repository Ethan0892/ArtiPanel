/**
 * Monitoring Page
 * 
 * System monitoring, alerts, and logs
 */

import React from 'react';

interface MonitoringPageProps {
  mode?: 'alerts' | 'metrics' | 'logs';
}

const Monitoring: React.FC<MonitoringPageProps> = ({ mode = 'alerts' }) => {
  // Mock data for demonstration
  const alerts = [
    { id: 1, severity: 'warning', message: 'High CPU usage detected on Node-1', time: '2 hours ago' },
    { id: 2, severity: 'info', message: 'Backup completed successfully', time: '4 hours ago' },
    { id: 3, severity: 'error', message: 'Disk space running low on /var', time: '6 hours ago' },
  ];

  const metrics = [
    { label: 'CPU Usage', value: '45%', trend: 'up' },
    { label: 'Memory Usage', value: '62%', trend: 'stable' },
    { label: 'Network I/O', value: '125 Mbps', trend: 'down' },
    { label: 'Disk I/O', value: '85 IOPS', trend: 'up' },
  ];

  return (
    <div className="page-container">
      <style>{`
        .page-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          background-color: var(--color-background);
        }

        .page-title {
          font-size: 32px;
          font-weight: 700;
          color: var(--color-text);
          margin-bottom: 24px;
        }

        .content-box {
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 20px;
        }

        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .alert-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background-color: var(--color-background);
          border-left: 4px solid;
          border-radius: 4px;
        }

        .alert-item.warning {
          border-left-color: #f59e0b;
        }

        .alert-item.error {
          border-left-color: #ef4444;
        }

        .alert-item.info {
          border-left-color: #3b82f6;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 16px;
        }

        .metric-card {
          background-color: var(--color-background);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 16px;
          text-align: center;
        }

        .metric-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--color-text);
          margin: 8px 0;
        }

        .logs-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 400px;
          overflow-y: auto;
        }

        .log-entry {
          display: flex;
          gap: 12px;
          padding: 8px;
          background-color: var(--color-background);
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: var(--color-text);
        }

        .log-time {
          color: var(--color-text-secondary);
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 16px;
          }

          .page-title {
            font-size: 24px;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <h1 className="page-title">
        {mode === 'alerts' && 'System Alerts'}
        {mode === 'metrics' && 'Performance Metrics'}
        {mode === 'logs' && 'System Logs'}
      </h1>

      <div className="content-box">
        {mode === 'alerts' && (
          <>
            <h2 style={{ marginBottom: '16px', color: 'var(--color-text)', fontWeight: '600' }}>Active Alerts</h2>
            <div className="alerts-list">
              {alerts.map(alert => (
                <div key={alert.id} className={`alert-item ${alert.severity}`}>
                  <div style={{ fontSize: '20px' }}>
                    {alert.severity === 'warning' && '⚠️'}
                    {alert.severity === 'error' && '❌'}
                    {alert.severity === 'info' && 'ℹ️'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--color-text)', fontWeight: '500', marginBottom: '4px' }}>{alert.message}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{alert.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {mode === 'metrics' && (
          <>
            <h2 style={{ marginBottom: '16px', color: 'var(--color-text)', fontWeight: '600' }}>Real-time Metrics</h2>
            <div className="metrics-grid">
              {metrics.map((metric, index) => (
                <div key={index} className="metric-card">
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{metric.label}</div>
                  <div className="metric-value">{metric.value}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-success)', fontWeight: '600' }}>
                    {metric.trend === 'up' && '📈 Increasing'}
                    {metric.trend === 'down' && '📉 Decreasing'}
                    {metric.trend === 'stable' && '➡️ Stable'}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {mode === 'logs' && (
          <>
            <h2 style={{ marginBottom: '16px', color: 'var(--color-text)', fontWeight: '600' }}>Recent Logs</h2>
            <div className="logs-list">
              <div className="log-entry">
                <span className="log-time">[2025-10-30 18:45:23]</span>
                <span>System started successfully</span>
              </div>
              <div className="log-entry">
                <span className="log-time">[2025-10-30 18:46:15]</span>
                <span>Node-1 connected from 192.168.1.100</span>
              </div>
              <div className="log-entry">
                <span className="log-time">[2025-10-30 18:47:42]</span>
                <span>Database connection pool initialized (5 connections)</span>
              </div>
              <div className="log-entry">
                <span className="log-time">[2025-10-30 18:48:01]</span>
                <span>API health check passed - all services operational</span>
              </div>
              <div className="log-entry">
                <span className="log-time">[2025-10-30 18:50:30]</span>
                <span>Scheduled backup completed (backup-20251030.tar.gz - 2.3GB)</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Monitoring;
