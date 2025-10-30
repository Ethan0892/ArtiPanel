/**
 * Remote Access Page
 * 
 * Console and file manager
 */

import React, { useState } from 'react';

interface RemotePageProps {
  mode?: 'console' | 'files';
}

const Remote: React.FC<RemotePageProps> = ({ mode = 'console' }) => {
  const [command, setCommand] = useState('');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([
    '[artipanel@node-1 ~]$ ls -la',
    'drwxr-xr-x  14 root root     4096 Oct 30 18:50 .',
    'drwxr-xr-x  13 root root     4096 Oct 29 12:45 ..',
    '-rw-r--r--   1 root root     1234 Oct 30 18:45 README.md',
    'drwxr-xr-x   3 root root     4096 Oct 30 18:30 projects',
    '[artipanel@node-1 ~]$ ',
  ]);

  const handleCommand = () => {
    if (command.trim()) {
      setConsoleOutput([...consoleOutput.slice(0, -1), command, `Result: ${command} executed successfully`, '[artipanel@node-1 ~]$ ']);
      setCommand('');
    }
  };

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
          padding: 24px;
        }

        .console {
          background-color: var(--color-background);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          padding: 16px;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: #00ff00;
          min-height: 400px;
          max-height: 500px;
          overflow-y: auto;
          margin-bottom: 16px;
        }

        .console-line {
          display: flex;
          gap: 8px;
          margin: 4px 0;
          line-height: 1.5;
        }

        .command-input {
          display: flex;
          gap: 12px;
        }

        .command-input input {
          flex: 1;
          padding: 10px;
          background-color: var(--color-background);
          border: 1px solid var(--color-border);
          border-radius: 4px;
          color: #00ff00;
          font-family: 'Courier New', monospace;
          font-size: 13px;
        }

        .command-input button {
          padding: 10px 20px;
          background-color: var(--color-primary);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .command-input button:hover {
          background-color: var(--color-secondary);
        }

        .file-tree {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .file-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background-color: var(--color-background);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .file-item:hover {
          background-color: var(--color-surface-alt);
        }

        .file-icon {
          font-size: 16px;
        }

        .file-name {
          flex: 1;
          color: var(--color-text);
        }

        .file-size {
          font-size: 12px;
          color: var(--color-text-secondary);
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 16px;
          }

          .page-title {
            font-size: 24px;
          }

          .console {
            min-height: 300px;
          }
        }
      `}</style>

      <h1 className="page-title">
        {mode === 'files' && 'File Manager'}
        {mode === 'console' && 'Remote Console'}
      </h1>

      <div className="content-box">
        {mode === 'console' && (
          <>
            <h2 style={{ marginBottom: '16px', color: 'var(--color-text)', fontWeight: '600' }}>SSH Console</h2>
            <div className="console">
              {consoleOutput.map((line, idx) => (
                <div key={idx} className="console-line">
                  <span>{line}</span>
                </div>
              ))}
            </div>
            <div className="command-input">
              <input
                type="text"
                placeholder="Enter command..."
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCommand()}
              />
              <button onClick={handleCommand}>Execute</button>
            </div>
          </>
        )}

        {mode === 'files' && (
          <>
            <h2 style={{ marginBottom: '16px', color: 'var(--color-text)', fontWeight: '600' }}>File Manager - /home/artipanel/</h2>
            <div className="file-tree">
              <div className="file-item">
                <span className="file-icon">📁</span>
                <span className="file-name">projects</span>
                <span className="file-size">folder</span>
              </div>
              <div className="file-item">
                <span className="file-icon">📁</span>
                <span className="file-name">configs</span>
                <span className="file-size">folder</span>
              </div>
              <div className="file-item">
                <span className="file-icon">📄</span>
                <span className="file-name">README.md</span>
                <span className="file-size">1.2 KB</span>
              </div>
              <div className="file-item">
                <span className="file-icon">📄</span>
                <span className="file-name">setup.sh</span>
                <span className="file-size">4.5 KB</span>
              </div>
              <div className="file-item">
                <span className="file-icon">📄</span>
                <span className="file-name">deploy.yml</span>
                <span className="file-size">2.1 KB</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Remote;
