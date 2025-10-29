/**
 * Monitoring Page
 * 
 * Alerts, metrics, and system logs
 */

import React from 'react';

interface MonitoringPageProps {
  mode?: 'alerts' | 'metrics' | 'logs';
}

const Monitoring: React.FC<MonitoringPageProps> = ({ mode = 'alerts' }) => {
  return (
    <div className="page-container">
      <style jsx>{`
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
          margin-bottom: 32px;
        }

        .content-box {
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 24px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text);
          margin-bottom: 16px;
        }

        .info-text {
          color: var(--color-text-secondary);
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 16px;
          }

          .page-title {
            font-size: 24px;
          }
        }
      `}</style>

      <h1 className="page-title">
        {mode === 'metrics' && 'Performance Metrics'}
        {mode === 'logs' && 'System Logs'}
        {mode === 'alerts' && 'Alerts'}
      </h1>

      <div className="content-box">
        <h2 className="section-title">
          {mode === 'metrics' && 'System Metrics'}
          {mode === 'logs' && 'Log Viewer'}
          {mode === 'alerts' && 'Active Alerts'}
        </h2>
        <p className="info-text">
          {mode === 'metrics' && 'Monitor CPU, memory, disk I/O, and network performance. View historical trends and performance graphs for all nodes and services.'}
          {mode === 'logs' && 'View system logs, application logs, and event history. Filter and search logs by date, component, and severity level.'}
          {mode === 'alerts' && 'Receive and manage system alerts for critical events, thresholds, and errors. Configure alert rules and notification preferences.'}
        </p>
      </div>
    </div>
  );
};

export default Monitoring;
