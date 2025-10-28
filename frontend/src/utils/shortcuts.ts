/**
 * ArtiPanel Keyboard Shortcuts System
 * 
 * Provides comprehensive keyboard shortcuts like Pelican and Pterodactyl
 * but with professional editor-style shortcuts (Ctrl+S, Ctrl+Z, etc)
 */

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  category: 'editor' | 'navigation' | 'general';
  action: () => void;
}

export class KeyboardShortcutManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private isEnabled = true;

  constructor() {
    this.initializeDefaultShortcuts();
  }

  /**
   * Initialize all default shortcuts
   */
  private initializeDefaultShortcuts(): void {
    // Editor shortcuts
    this.registerShortcut('s', {
      key: 's',
      ctrl: true,
      description: 'Save file',
      category: 'editor',
      action: () => this.triggerEvent('editor:save'),
    });

    this.registerShortcut('z', {
      key: 'z',
      ctrl: true,
      description: 'Undo',
      category: 'editor',
      action: () => this.triggerEvent('editor:undo'),
    });

    this.registerShortcut('y', {
      key: 'y',
      ctrl: true,
      description: 'Redo',
      category: 'editor',
      action: () => this.triggerEvent('editor:redo'),
    });

    this.registerShortcut('f', {
      key: 'f',
      ctrl: true,
      description: 'Find',
      category: 'editor',
      action: () => this.triggerEvent('editor:find'),
    });

    this.registerShortcut('h', {
      key: 'h',
      ctrl: true,
      description: 'Find & Replace',
      category: 'editor',
      action: () => this.triggerEvent('editor:find-replace'),
    });

    this.registerShortcut('/', {
      key: '/',
      ctrl: true,
      description: 'Toggle comment',
      category: 'editor',
      action: () => this.triggerEvent('editor:toggle-comment'),
    });

    this.registerShortcut('b', {
      key: 'b',
      ctrl: true,
      description: 'Format code',
      category: 'editor',
      action: () => this.triggerEvent('editor:format'),
    });

    this.registerShortcut('l', {
      key: 'l',
      ctrl: true,
      description: 'Go to line',
      category: 'editor',
      action: () => this.triggerEvent('editor:goto-line'),
    });

    // Tab management
    this.registerShortcut('n', {
      key: 'n',
      ctrl: true,
      description: 'New file',
      category: 'editor',
      action: () => this.triggerEvent('editor:new-file'),
    });

    this.registerShortcut('w', {
      key: 'w',
      ctrl: true,
      description: 'Close file',
      category: 'editor',
      action: () => this.triggerEvent('editor:close-file'),
    });

    this.registerShortcut('Tab', {
      key: 'Tab',
      ctrl: true,
      description: 'Next tab',
      category: 'editor',
      action: () => this.triggerEvent('editor:next-tab'),
    });

    this.registerShortcut('Tab', {
      key: 'Tab',
      ctrl: true,
      shift: true,
      description: 'Previous tab',
      category: 'editor',
      action: () => this.triggerEvent('editor:previous-tab'),
    });

    // Navigation shortcuts
    this.registerShortcut('k', {
      key: 'k',
      ctrl: true,
      description: 'Command palette',
      category: 'navigation',
      action: () => this.triggerEvent('nav:command-palette'),
    });

    this.registerShortcut('p', {
      key: 'p',
      ctrl: true,
      description: 'Quick open',
      category: 'navigation',
      action: () => this.triggerEvent('nav:quick-open'),
    });

    this.registerShortcut('/', {
      key: '/',
      shift: true,
      description: 'Toggle sidebar',
      category: 'navigation',
      action: () => this.triggerEvent('nav:toggle-sidebar'),
    });

    this.registerShortcut('f', {
      key: 'f',
      ctrl: true,
      shift: true,
      description: 'Toggle fullscreen',
      category: 'navigation',
      action: () => this.triggerEvent('nav:toggle-fullscreen'),
    });

    // General shortcuts
    this.registerShortcut('q', {
      key: 'q',
      ctrl: true,
      description: 'Quit',
      category: 'general',
      action: () => this.triggerEvent('app:quit'),
    });

    this.registerShortcut('?', {
      key: '?',
      shift: true,
      description: 'Show keyboard shortcuts',
      category: 'general',
      action: () => this.triggerEvent('app:show-help'),
    });
  }

  /**
   * Register a keyboard shortcut
   */
  registerShortcut(id: string, shortcut: Omit<KeyboardShortcut, 'key'> & { key?: string }): void {
    const key = shortcut.key || id;
    this.shortcuts.set(this.getShortcutKey(key, shortcut.ctrl, shortcut.shift, shortcut.alt), {
      ...shortcut,
      key,
    } as KeyboardShortcut);
  }

  /**
   * Get shortcut key identifier
   */
  private getShortcutKey(key: string, ctrl?: boolean, shift?: boolean, alt?: boolean): string {
    const parts: string[] = [];
    if (ctrl) parts.push('ctrl');
    if (shift) parts.push('shift');
    if (alt) parts.push('alt');
    parts.push(key.toLowerCase());
    return parts.join('+');
  }

  /**
   * Handle keyboard event
   */
  handleKeyPress = (e: KeyboardEvent): void => {
    if (!this.isEnabled) return;

    const shortcutKey = this.getShortcutKey(e.key, e.ctrlKey || e.metaKey, e.shiftKey, e.altKey);
    const shortcut = this.shortcuts.get(shortcutKey);

    if (shortcut) {
      e.preventDefault();
      shortcut.action();
    }
  };

  /**
   * Trigger event for shortcut action
   */
  private triggerEvent(eventName: string): void {
    const event = new CustomEvent(eventName, { detail: { timestamp: Date.now() } });
    window.dispatchEvent(event);
  }

  /**
   * Get all shortcuts
   */
  getAllShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Get shortcuts by category
   */
  getShortcutsByCategory(category: 'editor' | 'navigation' | 'general'): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values()).filter(s => s.category === category);
  }

  /**
   * Enable/disable shortcuts
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Add listener
   */
  addListener(): void {
    window.addEventListener('keydown', this.handleKeyPress);
  }

  /**
   * Remove listener
   */
  removeListener(): void {
    window.removeEventListener('keydown', this.handleKeyPress);
  }
}

// Global instance
export const shortcutManager = new KeyboardShortcutManager();
