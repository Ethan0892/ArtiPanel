/**
 * Router Component
 * 
 * Handles page routing based on selected navigation item
 */

import React from 'react';
import Dashboard from './pages/Dashboard';
import Servers from './pages/Servers';
import Nodes from './pages/Nodes';
import Storage from './pages/Storage';
import Monitoring from './pages/Monitoring';
import Remote from './pages/Remote';
import Settings from './pages/Settings';

interface RouterProps {
  currentPage: string;
}

const Router: React.FC<RouterProps> = ({ currentPage }) => {
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'servers':
      case 'servers-list':
        return <Servers />;
      case 'servers-create':
        return <Servers mode="create" />;
      case 'nodes':
      case 'nodes-list':
        return <Nodes />;
      case 'nodes-add':
        return <Nodes mode="add" />;
      case 'storage':
      case 'storage-overview':
        return <Storage />;
      case 'storage-raids':
        return <Storage mode="raids" />;
      case 'storage-shares':
        return <Storage mode="shares" />;
      case 'monitoring':
      case 'monitoring-alerts':
        return <Monitoring />;
      case 'monitoring-metrics':
        return <Monitoring mode="metrics" />;
      case 'monitoring-logs':
        return <Monitoring mode="logs" />;
      case 'remote':
      case 'remote-console':
        return <Remote />;
      case 'remote-files':
        return <Remote mode="files" />;
      case 'settings':
      case 'settings-general':
        return <Settings mode="general" />;
      case 'settings-notifications':
        return <Settings mode="notifications" />;
      case 'settings-security':
        return <Settings mode="security" />;
      case 'settings-api':
        return <Settings mode="api" />;
      case 'settings-display':
        return <Settings mode="display" />;
      default:
        return <Dashboard />;
    }
  };

  return <>{renderPage()}</>;
};

export default Router;
