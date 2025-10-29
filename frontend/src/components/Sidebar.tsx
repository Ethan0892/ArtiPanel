/**
 * Sidebar Navigation Component
 * 
 * Left sidebar with main navigation, inspired by Pterodactyl
 */

import React, { useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  subItems?: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['servers']));

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '[D]',
      path: '/dashboard',
    },
    {
      id: 'servers',
      label: 'Servers',
      icon: '[S]',
      path: '/servers',
      subItems: [
        { id: 'servers-list', label: 'All Servers', icon: '↳', path: '/servers' },
        { id: 'servers-create', label: 'Create Server', icon: '↳', path: '/servers/create' },
      ],
    },
    {
      id: 'nodes',
      label: 'Nodes',
      icon: '[N]',
      path: '/nodes',
      subItems: [
        { id: 'nodes-list', label: 'All Nodes', icon: '↳', path: '/nodes' },
        { id: 'nodes-add', label: 'Add Node', icon: '↳', path: '/nodes/add' },
      ],
    },
    {
      id: 'storage',
      label: 'Storage',
      icon: '[T]',
      path: '/storage',
      subItems: [
        { id: 'storage-overview', label: 'Overview', icon: '↳', path: '/storage' },
        { id: 'storage-raids', label: 'RAID Management', icon: '↳', path: '/storage/raids' },
        { id: 'storage-shares', label: 'Shares', icon: '↳', path: '/storage/shares' },
      ],
    },
    {
      id: 'monitoring',
      label: 'Monitoring',
      icon: '[M]',
      path: '/monitoring',
      subItems: [
        { id: 'monitoring-alerts', label: 'Alerts', icon: '↳', path: '/monitoring/alerts' },
        { id: 'monitoring-metrics', label: 'Metrics', icon: '↳', path: '/monitoring/metrics' },
        { id: 'monitoring-logs', label: 'Logs', icon: '↳', path: '/monitoring/logs' },
      ],
    },
    {
      id: 'remote',
      label: 'Remote Access',
      icon: '[R]',
      path: '/remote',
      subItems: [
        { id: 'remote-console', label: 'Console', icon: '↳', path: '/remote/console' },
        { id: 'remote-files', label: 'File Manager', icon: '↳', path: '/remote/files' },
      ],
    },
  ];

  const toggleExpand = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const renderNavItem = (item: NavItem, level: number = 0) => (
    <div key={item.id}>
      <div
        className="nav-item"
        onClick={() => item.subItems && toggleExpand(item.id)}
        style={{ paddingLeft: `${level * 12}px` }}
      >
        <span className="nav-icon">{item.icon}</span>
        <span className="nav-label">{item.label}</span>
        {item.subItems && (
          <span className={`expand-icon ${expandedItems.has(item.id) ? 'expanded' : ''}`}>
            ▸
          </span>
        )}
      </div>
      {item.subItems && expandedItems.has(item.id) && (
        <div className="nav-subitems">
          {item.subItems.map(subItem => renderNavItem(subItem, level + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <style jsx>{`
        .sidebar {
          width: 260px;
          background-color: var(--color-surface);
          border-right: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          overflow-y: auto;
        }

        .sidebar.closed {
          width: 60px;
        }

        .sidebar-header {
          padding: 16px;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: bold;
          font-size: 16px;
          color: var(--color-primary);
        }

        .sidebar-logo-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .sidebar-logo-text {
          display: block;
        }

        .sidebar.closed .sidebar-logo-text {
          display: none;
        }

        .toggle-btn {
          background: none;
          border: none;
          color: var(--color-text-secondary);
          cursor: pointer;
          padding: 4px;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toggle-btn:hover {
          color: var(--color-text);
        }

        .sidebar-content {
          flex: 1;
          padding: 8px 0;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          cursor: pointer;
          color: var(--color-text-secondary);
          transition: all 0.2s ease;
          user-select: none;
          white-space: nowrap;
        }

        .nav-item:hover {
          background-color: var(--color-surface-alt);
          color: var(--color-text);
        }

        .nav-icon {
          font-size: 18px;
          min-width: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-label {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar.closed .nav-label {
          display: none;
        }

        .expand-icon {
          font-size: 12px;
          transition: transform 0.2s ease;
          color: var(--color-text-secondary);
        }

        .expand-icon.expanded {
          transform: rotate(90deg);
        }

        .sidebar.closed .expand-icon {
          display: none;
        }

        .nav-subitems {
          background-color: rgba(0, 0, 0, 0.1);
        }

        .sidebar-footer {
          padding: 12px;
          border-top: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: flex-start;
        }

        .user-info {
          flex: 1;
          min-width: 0;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          flex-shrink: 0;
        }

        .user-name {
          font-size: 12px;
          color: var(--color-text);
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-status {
          font-size: 11px;
          color: var(--color-success);
        }

        .sidebar.closed .user-info {
          display: none;
        }

        @media (max-width: 768px) {
          .sidebar {
            position: absolute;
            left: 0;
            top: 0;
            height: 100vh;
            z-index: 1000;
            transform: translateX(-100%);
          }

          .sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>

      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">⚙️</div>
          <span className="sidebar-logo-text">ArtiPanel</span>
        </div>
        <button className="toggle-btn" onClick={onToggle} title="Toggle sidebar">
          ← 
        </button>
      </div>

      <div className="sidebar-content">
        {navItems.map(item => renderNavItem(item))}
      </div>

      <div className="sidebar-footer">
        <div className="user-avatar">U</div>
        <div className="user-info">
          <div className="user-name">User</div>
          <div className="user-status">● Online</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
