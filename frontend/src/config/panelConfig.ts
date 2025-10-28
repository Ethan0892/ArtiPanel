/**
 * ArtiPanel Frontend Configuration
 * Professional enterprise-grade UI/UX settings
 */

export const PANEL_CONFIG = {
  // Branding
  appName: 'ArtiPanel',
  appVersion: '0.1.0-alpha.1',
  appTagline: 'Enterprise Server Management Platform',
  
  // API Configuration
  api: {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // WebSocket Configuration
  websocket: {
    url: process.env.REACT_APP_WS_URL || 'ws://localhost:4000',
    reconnectAttempts: 5,
    reconnectDelay: 3000,
    heartbeatInterval: 30000,
  },

  // UI/UX Settings
  ui: {
    // Animations
    animationEnabled: true,
    animationDuration: 300,
    
    // Responsive design breakpoints
    breakpoints: {
      mobile: 576,
      tablet: 768,
      desktop: 1024,
      widescreen: 1216,
      fullhd: 1408,
    },

    // Sidebar behavior
    sidebar: {
      defaultOpen: true,
      autoClose: false,
      collapseThreshold: 768,
    },

    // Loading states
    loadingIndicator: {
      showDuration: 300,
      hideDuration: 500,
    },

    // Notifications
    notifications: {
      position: 'top-right',
      autoCloseDuration: 5000,
      maxStack: 3,
    },

    // Pagination
    pagination: {
      itemsPerPage: 20,
      maxPages: 10,
    },
  },

  // Feature Flags
  features: {
    gamingServers: true,
    nasManagement: false,
    kubernetes: false,
    autoScaling: false,
    aiSuggestions: false,
  },

  // Performance
  performance: {
    cacheEnabled: true,
    cacheDuration: 300000, // 5 minutes
    lazyLoadImages: true,
    enableServiceWorker: false,
    compressionEnabled: true,
  },

  // Security
  security: {
    enableCSP: true,
    enableXSSProtection: true,
    enableClickjacking: true,
    sessionTimeout: 3600000, // 1 hour
    enableBiometric: false,
  },

  // Analytics & Monitoring
  monitoring: {
    enabled: true,
    trackPageViews: true,
    trackErrors: true,
    trackPerformance: true,
    sampleRate: 1.0, // 100%
  },

  // Logging
  logging: {
    enabled: true,
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    captureErrors: true,
    captureWarnings: false,
  },

  // Date & Time
  localization: {
    locale: 'en-US',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm:ss',
  },

  // Advanced Features
  advanced: {
    enableDebugMode: process.env.NODE_ENV === 'development',
    enablePerformanceMonitoring: true,
    enableAccessibilityMode: false,
    enableHighContrast: false,
  },
};

// Export configuration with Object.freeze to prevent mutations
export default Object.freeze(PANEL_CONFIG);
