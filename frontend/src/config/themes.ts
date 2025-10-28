/**
 * ArtiPanel Theme Configuration System
 * 
 * Provides multiple pre-built themes inspired by Pelican and Pterodactyl
 * with fully customizable color schemes
 */

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  isDark: boolean;
}

// Dark Pterodactyl-inspired theme (default)
export const THEME_PTERODACTYL_DARK: Theme = {
  id: 'pterodactyl-dark',
  name: 'Pterodactyl Dark',
  description: 'Dark theme inspired by Pterodactyl Panel',
  isDark: true,
  colors: {
    primary: '#6366f1',      // Indigo
    secondary: '#8b5cf6',    // Violet
    accent: '#ec4899',       // Pink
    background: '#0f172a',   // Slate-950
    surface: '#1e293b',      // Slate-900
    surfaceAlt: '#334155',   // Slate-700
    text: '#f1f5f9',         // Slate-100
    textSecondary: '#cbd5e1',// Slate-300
    border: '#475569',       // Slate-600
    success: '#10b981',      // Emerald
    warning: '#f59e0b',      // Amber
    error: '#ef4444',        // Red
    info: '#0ea5e9',         // Cyan
  },
};

// Light Pelican-inspired theme
export const THEME_PELICAN_LIGHT: Theme = {
  id: 'pelican-light',
  name: 'Pelican Light',
  description: 'Light theme inspired by Pelican Panel',
  isDark: false,
  colors: {
    primary: '#3b82f6',      // Blue
    secondary: '#06b6d4',    // Cyan
    accent: '#ec4899',       // Pink
    background: '#ffffff',   // White
    surface: '#f8fafc',      // Slate-50
    surfaceAlt: '#e2e8f0',   // Slate-200
    text: '#0f172a',         // Slate-950
    textSecondary: '#475569',// Slate-600
    border: '#cbd5e1',       // Slate-300
    success: '#059669',      // Emerald
    warning: '#d97706',      // Amber
    error: '#dc2626',        // Red
    info: '#0284c7',         // Cyan
  },
};

// Modern dark theme
export const THEME_MODERN_DARK: Theme = {
  id: 'modern-dark',
  name: 'Modern Dark',
  description: 'Contemporary dark theme with vibrant accents',
  isDark: true,
  colors: {
    primary: '#7c3aed',      // Violet
    secondary: '#06b6d4',    // Cyan
    accent: '#f97316',       // Orange
    background: '#0a0e27',   // Very Dark Blue
    surface: '#1a1f3a',      // Dark Blue
    surfaceAlt: '#2d3748',   // Dark Gray-Blue
    text: '#f0f4f8',         // Light
    textSecondary: '#cbd5e1',// Medium Light
    border: '#4a5568',       // Medium
    success: '#10b981',      // Emerald
    warning: '#f59e0b',      // Amber
    error: '#ef4444',        // Red
    info: '#0ea5e9',         // Cyan
  },
};

// Nord-inspired theme
export const THEME_NORD: Theme = {
  id: 'nord',
  name: 'Nord',
  description: 'Nord color scheme inspired theme',
  isDark: true,
  colors: {
    primary: '#88c0d0',      // Frost 1
    secondary: '#81a1c1',    // Frost 2
    accent: '#bf616a',       // Aurora Red
    background: '#2e3440',   // Polar Night 0
    surface: '#3b4252',      // Polar Night 1
    surfaceAlt: '#434c5e',   // Polar Night 2
    text: '#eceff4',         // Snow Storm 2
    textSecondary: '#d8dee9',// Snow Storm 1
    border: '#4c566a',       // Polar Night 3
    success: '#a3be8c',      // Aurora Green
    warning: '#ebcb8b',      // Aurora Yellow
    error: '#bf616a',        // Aurora Red
    info: '#81a1c1',         // Frost 2
  },
};

// One Dark Pro inspired
export const THEME_ONE_DARK: Theme = {
  id: 'one-dark',
  name: 'One Dark Pro',
  description: 'One Dark Pro inspired theme',
  isDark: true,
  colors: {
    primary: '#61afef',      // Blue
    secondary: '#c678dd',    // Purple
    accent: '#e06c75',       // Red
    background: '#282c34',   // Background
    surface: '#3e4451',      // Surface
    surfaceAlt: '#4f5a66',   // Surface Alt
    text: '#abb2bf',         // Text
    textSecondary: '#5c6370',// Text Secondary
    border: '#565c64',       // Border
    success: '#98c379',      // Green
    warning: '#e5c07b',      // Yellow
    error: '#e06c75',        // Red
    info: '#56b6c2',         // Cyan
  },
};

// Dracula inspired
export const THEME_DRACULA: Theme = {
  id: 'dracula',
  name: 'Dracula',
  description: 'Dracula color scheme theme',
  isDark: true,
  colors: {
    primary: '#8be9fd',      // Cyan
    secondary: '#ff79c6',    // Pink
    accent: '#ffb86c',       // Orange
    background: '#282a36',   // Background
    surface: '#44475a',      // Current Line
    surfaceAlt: '#6272a4',   // Comment
    text: '#f8f8f2',         // Foreground
    textSecondary: '#f1f2f8',// Light Foreground
    border: '#44475a',       // Current Line
    success: '#50fa7b',      // Green
    warning: '#f1fa8c',      // Yellow
    error: '#ff5555',        // Red
    info: '#8be9fd',         // Cyan
  },
};

// Solarized Dark
export const THEME_SOLARIZED_DARK: Theme = {
  id: 'solarized-dark',
  name: 'Solarized Dark',
  description: 'Solarized dark color scheme',
  isDark: true,
  colors: {
    primary: '#268bd2',      // Blue
    secondary: '#2aa198',    // Cyan
    accent: '#d33682',       // Magenta
    background: '#002b36',   // Base03
    surface: '#073642',      // Base02
    surfaceAlt: '#586e75',   // Base01
    text: '#93a1a1',         // Base1
    textSecondary: '#839496',// Base0
    border: '#657b83',       // Base00
    success: '#859900',      // Green
    warning: '#b58900',      // Yellow
    error: '#dc322f',        // Red
    info: '#268bd2',         // Blue
  },
};

// All available themes
export const AVAILABLE_THEMES: Theme[] = [
  THEME_PTERODACTYL_DARK,
  THEME_PELICAN_LIGHT,
  THEME_MODERN_DARK,
  THEME_NORD,
  THEME_ONE_DARK,
  THEME_DRACULA,
  THEME_SOLARIZED_DARK,
];

/**
 * Apply theme to document
 */
export const applyTheme = (theme: Theme): void => {
  const root = document.documentElement;
  const colors = theme.colors;

  // Set CSS variables
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-background', colors.background);
  root.style.setProperty('--color-surface', colors.surface);
  root.style.setProperty('--color-surface-alt', colors.surfaceAlt);
  root.style.setProperty('--color-text', colors.text);
  root.style.setProperty('--color-text-secondary', colors.textSecondary);
  root.style.setProperty('--color-border', colors.border);
  root.style.setProperty('--color-success', colors.success);
  root.style.setProperty('--color-warning', colors.warning);
  root.style.setProperty('--color-error', colors.error);
  root.style.setProperty('--color-info', colors.info);

  // Set dark mode class if needed
  if (theme.isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  // Store theme preference
  localStorage.setItem('artipanel-theme', theme.id);
};

/**
 * Get saved theme or default
 */
export const getSavedTheme = (): Theme => {
  const saved = localStorage.getItem('artipanel-theme');
  if (saved) {
    const theme = AVAILABLE_THEMES.find(t => t.id === saved);
    if (theme) return theme;
  }
  return THEME_PTERODACTYL_DARK;
};

/**
 * Create custom theme
 */
export const createCustomTheme = (
  name: string,
  colors: Partial<ThemeColors>,
  isDark: boolean = true
): Theme => {
  const baseTheme = isDark ? THEME_PTERODACTYL_DARK : THEME_PELICAN_LIGHT;
  return {
    id: `custom-${Date.now()}`,
    name,
    description: 'Custom user theme',
    isDark,
    colors: { ...baseTheme.colors, ...colors },
  };
};

/**
 * Custom theme storage
 */
export const saveCustomTheme = (theme: Theme): void => {
  const custom = JSON.parse(localStorage.getItem('artipanel-custom-themes') || '[]');
  custom.push(theme);
  localStorage.setItem('artipanel-custom-themes', JSON.stringify(custom));
};

export const getCustomThemes = (): Theme[] => {
  const custom = localStorage.getItem('artipanel-custom-themes');
  return custom ? JSON.parse(custom) : [];
};
