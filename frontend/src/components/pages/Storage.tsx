/**
 * Storage Page
 * 
 * Storage management, RAID, and shares
 */

import React, { useState, useEffect } from 'react';

interface StoragePageProps {
  mode?: 'overview' | 'raids' | 'shares';
}

const Storage: React.FC<StoragePageProps> = ({ mode = 'overview' }) => {
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
        {mode === 'raids' && 'RAID Management'}
        {mode === 'shares' && 'Shares'}
        {mode === 'overview' && 'Storage'}
      </h1>

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
    </div>
  );
};

export default Storage;
