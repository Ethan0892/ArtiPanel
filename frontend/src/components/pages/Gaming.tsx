/**
 * Gaming Server Deployment Page
 * Deploy and manage game servers
 */

import React, { useState } from 'react';
import { useGameServers } from '../hooks/useApi';

const Gaming: React.FC = () => {
  const { data: gameServers, loading, error, refetch } = useGameServers();
  const [selectedGameServerId, setSelectedGameServerId] = useState<string | null>(null);
  const [showDeployForm, setShowDeployForm] = useState(false);
  const [selectedGame, setSelectedGame] = useState('minecraft');

  const GAME_TEMPLATES = {
    minecraft: {
      name: 'Minecraft',
      icon: '⛏️',
      versions: ['1.20.1', '1.19.2', '1.18.2'],
      plugins: ['EssentialsX', 'WorldEdit', 'LiteBans'],
      defaultPort: 25565,
    },
    csgo: {
      name: 'CS:GO',
      icon: '🎯',
      versions: ['Latest'],
      mods: ['MetaMod', 'SourceMod'],
      defaultPort: 27015,
    },
    rust: {
      name: 'Rust',
      icon: '🔧',
      versions: ['Staging', 'Live'],
      wipes: ['Procedural Map', 'Barren', 'Frozen'],
      defaultPort: 28015,
    },
    arkse: {
      name: 'ARK: Survival Evolved',
      icon: '🦕',
      versions: ['Latest'],
      maps: ['The Island', 'Ragnarok', 'Scorched Earth'],
      defaultPort: 7777,
    },
    palworld: {
      name: 'Palworld',
      icon: '👾',
      versions: ['Latest'],
      difficulty: ['Normal', 'Hard'],
      defaultPort: 8211,
    },
  };

  if (loading) {
    return (
      <div className="gaming-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading game servers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gaming-page">
        <div className="error">
          <p>Error loading game servers: {error.message}</p>
          <button onClick={() => refetch()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="gaming-page">
      <div className="page-header">
        <h1>🎮 Gaming Servers</h1>
        <button
          className="btn-primary"
          onClick={() => setShowDeployForm(true)}
          title="Ctrl+G"
        >
          ➕ Deploy Server
        </button>
      </div>

      {showDeployForm && (
        <div className="deploy-form-panel">
          <h2>Deploy Game Server</h2>

          <div className="game-selector">
            <p className="selector-label">Select Game</p>
            <div className="game-buttons">
              {Object.entries(GAME_TEMPLATES).map(([key, game]: any) => (
                <button
                  key={key}
                  className={`game-btn ${selectedGame === key ? 'active' : ''}`}
                  onClick={() => setSelectedGame(key)}
                >
                  {game.icon} {game.name}
                </button>
              ))}
            </div>
          </div>

          <form className="deployment-form">
            <div className="form-group">
              <label>Server Name</label>
              <input type="text" placeholder="My Awesome Server" />
            </div>

            <div className="form-group">
              <label>Game Version</label>
              <select>
                {GAME_TEMPLATES[selectedGame as keyof typeof GAME_TEMPLATES]
                  ?.versions?.map((v: string) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label>Server Node</label>
              <select>
                <option>US-Node-01 (New York)</option>
                <option>EU-Node-01 (Germany)</option>
                <option>AS-Node-01 (Singapore)</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Max Players</label>
                <input type="number" min="2" max="128" defaultValue="20" />
              </div>

              <div className="form-group">
                <label>Port</label>
                <input
                  type="number"
                  defaultValue={
                    GAME_TEMPLATES[
                      selectedGame as keyof typeof GAME_TEMPLATES
                    ]?.defaultPort
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label>MOTD / Description</label>
              <textarea
                placeholder="Welcome to my game server!"
                rows={3}
              ></textarea>
            </div>

            {selectedGame === 'minecraft' && (
              <div className="form-group">
                <label>Plugins</label>
                <div className="checkbox-group">
                  <label>
                    <input type="checkbox" defaultChecked />
                    EssentialsX
                  </label>
                  <label>
                    <input type="checkbox" />
                    WorldEdit
                  </label>
                  <label>
                    <input type="checkbox" />
                    LiteBans
                  </label>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                🚀 Deploy Server
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowDeployForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="game-servers-container">
        <div className="active-servers">
          <h2>🟢 Active Servers</h2>
          <div className="servers-list">
            {gameServers && Array.isArray(gameServers)
              ? gameServers
                  .filter((s: any) => s.status === 'running')
                  .map((server: any) => (
                    <div
                      key={server.id}
                      className="server-item"
                      onClick={() => setSelectedGameServerId(server.id)}
                    >
                      <div className="server-info">
                        <h3>{server.name}</h3>
                        <p className="game-type">{server.game} {server.version}</p>
                        <p className="players">
                          👥 {Math.floor(Math.random() * server.maxPlayers)} / {server.maxPlayers} players
                        </p>
                      </div>
                      <div className="server-actions">
                        <button className="btn-small">💬 RCON</button>
                        <button className="btn-small btn-warning">⏸️ Stop</button>
                      </div>
                    </div>
                  ))
              : null}
          </div>
        </div>

        <div className="stopped-servers">
          <h2>⏸️ Stopped Servers</h2>
          <div className="servers-list">
            {gameServers && Array.isArray(gameServers)
              ? gameServers
                  .filter((s: any) => s.status === 'stopped')
                  .map((server: any) => (
                    <div key={server.id} className="server-item stopped">
                      <div className="server-info">
                        <h3>{server.name}</h3>
                        <p className="game-type">{server.game}</p>
                      </div>
                      <div className="server-actions">
                        <button className="btn-small btn-success">▶️ Start</button>
                        <button className="btn-small btn-danger">🗑️ Delete</button>
                      </div>
                    </div>
                  ))
              : null}
          </div>
        </div>
      </div>

      {selectedGameServerId && (
        <div className="game-server-detail-panel">
          <div className="detail-header">
            <h2>Server Console</h2>
            <button onClick={() => setSelectedGameServerId(null)}>✕</button>
          </div>

          <div className="detail-content">
            <div className="console-section">
              <div className="console-output">
                <div className="console-line">[INFO] Server started</div>
                <div className="console-line">[INFO] Loaded 12 plugins</div>
                <div className="console-line">[WARN] Memory usage high</div>
                <div className="console-line">[INFO] Player joined: Steve</div>
              </div>
              <div className="console-input">
                <input type="text" placeholder="Enter command..." />
                <button>Send</button>
              </div>
            </div>

            <div className="players-section">
              <h3>Online Players</h3>
              <div className="players-list">
                <div className="player-item">
                  <span className="player-name">Steve</span>
                  <span className="player-ping">45ms</span>
                </div>
                <div className="player-item">
                  <span className="player-name">Alex</span>
                  <span className="player-ping">62ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .gaming-page {
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

        .deploy-form-panel {
          background: var(--color-surface);
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 24px;
          border-left: 4px solid var(--color-primary);
        }

        .game-selector {
          margin-bottom: 24px;
        }

        .selector-label {
          margin: 0 0 12px 0;
          color: var(--color-text);
          font-weight: 600;
        }

        .game-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
        }

        .game-btn {
          padding: 12px;
          border: 2px solid var(--color-border);
          background: var(--color-background);
          color: var(--color-text);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
          font-weight: 600;
        }

        .game-btn:hover {
          border-color: var(--color-primary);
        }

        .game-btn.active {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }

        .deployment-form {
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
        .form-group select,
        .form-group textarea {
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

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .checkbox-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
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

        .game-servers-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .game-servers-container {
            grid-template-columns: 1fr;
          }
        }

        .active-servers,
        .stopped-servers {
          background: var(--color-surface);
          border-radius: 8px;
          padding: 20px;
        }

        .active-servers h2,
        .stopped-servers h2 {
          margin: 0 0 16px 0;
          color: var(--color-text);
          font-size: 16px;
        }

        .servers-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .server-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: var(--color-background);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .server-item:hover {
          background: var(--color-primary);
        }

        .server-item.stopped {
          opacity: 0.6;
        }

        .server-info {
          flex: 1;
        }

        .server-info h3 {
          margin: 0;
          color: var(--color-text);
          font-size: 14px;
        }

        .game-type,
        .players {
          margin: 4px 0 0 0;
          font-size: 12px;
          color: var(--color-text-secondary);
        }

        .server-actions {
          display: flex;
          gap: 8px;
        }

        .btn-small {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          background: var(--color-primary);
          color: white;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .btn-warning {
          background: var(--color-warning);
        }

        .btn-success {
          background: var(--color-success);
        }

        .btn-danger {
          background: var(--color-error);
        }

        .game-server-detail-panel {
          position: fixed;
          right: 0;
          top: 0;
          width: 400px;
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

        .console-section {
          margin-bottom: 20px;
        }

        .console-output {
          background: var(--color-background);
          border-radius: 4px;
          padding: 12px;
          height: 200px;
          overflow-y: auto;
          margin-bottom: 8px;
          font-family: monospace;
          font-size: 12px;
        }

        .console-line {
          margin: 2px 0;
          color: var(--color-text-secondary);
        }

        .console-input {
          display: flex;
          gap: 8px;
        }

        .console-input input {
          flex: 1;
          padding: 8px;
          border: 1px solid var(--color-border);
          border-radius: 4px;
          background: var(--color-background);
          color: var(--color-text);
        }

        .console-input button {
          padding: 8px 16px;
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .players-section h3 {
          margin: 0 0 12px 0;
          color: var(--color-text);
        }

        .players-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .player-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: var(--color-background);
          border-radius: 4px;
          font-size: 13px;
        }

        .player-ping {
          color: var(--color-success);
          font-weight: 600;
        }

        .loading,
        .error {
          text-align: center;
          padding: 60px 20px;
        }
      `}</style>
    </div>
  );
};

export default Gaming;
