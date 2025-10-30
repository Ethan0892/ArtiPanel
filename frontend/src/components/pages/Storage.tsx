/**
 * Storage Page
 * 
 * Storage management, RAID, and shares
 */

import React from 'react';
import { useValidatedList } from '../../hooks/useValidatedApi';
import { StorageSchema } from '../../utils/validation';
import { ErrorDisplay, LoadingSkeleton } from '../ErrorBoundary';

interface StoragePageProps {
  mode?: 'overview' | 'raids' | 'shares';
}

const Storage: React.FC<StoragePageProps> = ({ mode = 'overview' }) => {
  const { data: storageData, loading, error, refetch } = useValidatedList(
    '/storage',
    StorageSchema,
    { refetchInterval: 30000 }
  );

  const storage = (storageData as any)?.data || [];

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

        .storage-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .storage-card {
          background-color: var(--color-background);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 16px;
        }

        .storage-name {
          font-weight: 600;
          color: var(--color-text);
          margin-bottom: 8px;
        }

        .storage-usage {
          width: 100%;
          height: 8px;
          background-color: var(--color-border);
          border-radius: 4px;
          overflow: hidden;
          margin: 12px 0;
        }

        .storage-usage-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 16px;
          }

          .page-title {
            font-size: 24px;
          }

          .storage-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <h1 className="page-title">
        {mode === 'raids' && 'RAID Management'}
        {mode === 'shares' && 'Shares'}
        {mode === 'overview' && 'Storage'}
      </h1>

      {error && <ErrorDisplay error={error} onDismiss={() => {}} />}

      {loading ? (
        <LoadingSkeleton count={4} />
      ) : (
        <>
          <div className="content-box">
            <h2 className="section-title">
              {mode === 'raids' && 'RAID Configuration'}
              {mode === 'shares' && 'Network Shares'}
              {mode === 'overview' && 'Storage Overview'}
            </h2>
            <p className="info-text">
              {mode === 'raids' && 'Manage RAID arrays and disk redundancy settings. Monitor disk health and configure RAID levels for optimal performance and data protection.'}
              {mode === 'shares' && 'Create and manage network shares for remote file access. Configure permissions, quotas, and backup schedules for shared storage.'}
              {mode === 'overview' && 'View storage usage statistics, disk space allocation, and storage performance metrics across all nodes.'}
            </p>
          </div>

          {storage.length > 0 && (
            <div className="storage-grid">
              {storage.map((item: any) => (
                <div key={item.id} className="storage-card">
                  <div className="storage-name">{item.name}</div>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {item.type || 'Local'} • {item.size || 100}GB
                  </p>
                  <div className="storage-usage">
                    <div className="storage-usage-bar" style={{ width: `${Math.min(((item.used || 50) / (item.size || 100)) * 100, 100)}%` }}></div>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {item.used || 50}GB / {item.size || 100}GB used
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

export default Storage;
