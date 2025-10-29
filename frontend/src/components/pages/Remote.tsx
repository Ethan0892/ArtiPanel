/**
 * Remote Access Page
 * 
 * Console and file manager
 */

import React from 'react';

interface RemotePageProps {
  mode?: 'console' | 'files';
}

const Remote: React.FC<RemotePageProps> = ({ mode = 'console' }) => {
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
        {mode === 'files' && 'File Manager'}
        {mode === 'console' && 'Remote Console'}
      </h1>

      <div className="content-box">
        <h2 className="section-title">
          {mode === 'files' && 'File Browser'}
          {mode === 'console' && 'SSH Console'}
        </h2>
        <p className="info-text">
          {mode === 'files' && 'Browse, upload, and manage files on remote servers. Edit files, manage permissions, and handle file operations securely.'}
          {mode === 'console' && 'Execute commands and manage remote servers via SSH console. View output, manage processes, and troubleshoot issues.'}
        </p>
      </div>
    </div>
  );
};

export default Remote;
