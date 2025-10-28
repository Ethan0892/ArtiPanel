/**
 * File Editor Component with Keyboard Shortcuts
 * 
 * Professional code editor with Ctrl+S save, Ctrl+Z undo, etc.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';

interface FileEditorProps {
  filename?: string;
  initialContent?: string;
  onSave?: (content: string) => Promise<void>;
  readOnly?: boolean;
}

interface EditorState {
  content: string;
  history: string[];
  historyIndex: number;
  unsavedChanges: boolean;
  isSaving: boolean;
}

const FileEditor: React.FC<FileEditorProps> = ({
  filename = 'untitled.txt',
  initialContent = '',
  onSave,
  readOnly = false,
}) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [state, setState] = useState<EditorState>({
    content: initialContent,
    history: [initialContent],
    historyIndex: 0,
    unsavedChanges: false,
    isSaving: false,
  });

  const [lineCount, setLineCount] = useState(1);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });

  // Update line count and cursor position
  const updateEditorStats = useCallback(() => {
    if (editorRef.current) {
      const text = editorRef.current.value;
      const lines = text.split('\n').length;
      setLineCount(lines);

      // Calculate cursor position
      const beforeCursor = text.substring(0, editorRef.current.selectionStart);
      const line = beforeCursor.split('\n').length;
      const column = beforeCursor.split('\n').pop()?.length ?? 1;
      setCursorPosition({ line, column });
    }
  }, []);

  // Handle content changes
  const handleContentChange = useCallback((newContent: string) => {
    setState(prev => {
      // Add to history
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(newContent);

      return {
        ...prev,
        content: newContent,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        unsavedChanges: true,
      };
    });

    updateEditorStats();
  }, [updateEditorStats]);

  // Handle undo (Ctrl+Z)
  const handleUndo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex > 0) {
        const newIndex = prev.historyIndex - 1;
        return {
          ...prev,
          content: prev.history[newIndex],
          historyIndex: newIndex,
          unsavedChanges: newIndex !== 0,
        };
      }
      return prev;
    });

    updateEditorStats();
  }, [updateEditorStats]);

  // Handle redo (Ctrl+Y)
  const handleRedo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex < prev.history.length - 1) {
        const newIndex = prev.historyIndex + 1;
        return {
          ...prev,
          content: prev.history[newIndex],
          historyIndex: newIndex,
          unsavedChanges: true,
        };
      }
      return prev;
    });

    updateEditorStats();
  }, [updateEditorStats]);

  // Handle save (Ctrl+S)
  const handleSave = useCallback(async () => {
    if (!onSave || !state.unsavedChanges) return;

    setState(prev => ({ ...prev, isSaving: true }));
    try {
      await onSave(state.content);
      setState(prev => ({
        ...prev,
        unsavedChanges: false,
        isSaving: false,
      }));
    } catch (error) {
      console.error('Save failed:', error);
      setState(prev => ({ ...prev, isSaving: false }));
    }
  }, [state.content, state.unsavedChanges, onSave]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'z':
            if (!e.shiftKey) {
              e.preventDefault();
              handleUndo();
            }
            break;
          case 'y':
            e.preventDefault();
            handleRedo();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleUndo, handleRedo]);

  // Sync ref value
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.value = state.content;
    }
  }, [state.content]);

  return (
    <div className="file-editor">
      <style jsx>{`
        .file-editor {
          display: flex;
          flex-direction: column;
          height: 100%;
          background-color: var(--color-surface);
          border-radius: 8px;
          overflow: hidden;
        }

        .editor-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background-color: var(--color-surface-alt);
          border-bottom: 1px solid var(--color-border);
          gap: 12px;
        }

        .editor-filename {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;
        }

        .file-icon {
          font-size: 16px;
        }

        .file-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .unsaved-indicator {
          color: var(--color-warning);
          font-weight: bold;
          margin-left: 4px;
        }

        .editor-stats {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 12px;
          color: var(--color-text-secondary);
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .editor-toolbar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background-color: var(--color-surface-alt);
          border-bottom: 1px solid var(--color-border);
        }

        .editor-button {
          background: none;
          border: 1px solid var(--color-border);
          color: var(--color-text-secondary);
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 4px;
          font-size: 12px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .editor-button:hover {
          background-color: var(--color-surface);
          color: var(--color-text);
        }

        .editor-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .editor-button.primary {
          background-color: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }

        .editor-button.primary:hover {
          opacity: 0.9;
        }

        .shortcut-hint {
          font-size: 10px;
          color: var(--color-text-secondary);
          margin-left: auto;
          background-color: rgba(0, 0, 0, 0.2);
          padding: 2px 6px;
          border-radius: 3px;
        }

        .editor-body {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .line-numbers {
          background-color: var(--color-surface-alt);
          border-right: 1px solid var(--color-border);
          padding: 12px 8px;
          text-align: right;
          user-select: none;
          overflow: hidden;
          min-width: 50px;
        }

        .line-number {
          display: block;
          height: 19px;
          line-height: 19px;
          color: var(--color-text-secondary);
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 12px;
        }

        .editor-content {
          flex: 1;
          overflow: hidden;
        }

        .editor-textarea {
          width: 100%;
          height: 100%;
          border: none;
          background-color: var(--color-surface);
          color: var(--color-text);
          font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.5;
          padding: 12px;
          padding-left: 0;
          resize: none;
          outline: none;
          overflow: auto;
          white-space: pre;
          word-wrap: normal;
        }

        .editor-textarea::selection {
          background-color: var(--color-primary);
          opacity: 0.3;
        }

        .editor-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          background-color: var(--color-surface-alt);
          border-top: 1px solid var(--color-border);
          font-size: 11px;
          color: var(--color-text-secondary);
        }

        .cursor-position {
          display: flex;
          gap: 16px;
        }

        @media (max-width: 768px) {
          .editor-stats {
            display: none;
          }

          .line-numbers {
            min-width: 40px;
            padding: 12px 4px;
          }
        }
      `}</style>

      <div className="editor-header">
        <div className="editor-filename">
          <span className="file-icon">📄</span>
          <span className="file-name">
            {filename}
            {state.unsavedChanges && <span className="unsaved-indicator">●</span>}
          </span>
        </div>
        <div className="editor-stats">
          <div className="stat">Lines: {lineCount}</div>
          <div className="stat">Chars: {state.content.length}</div>
          <div className="stat">Encoding: UTF-8</div>
        </div>
      </div>

      <div className="editor-toolbar">
        <button
          className="editor-button"
          onClick={handleUndo}
          disabled={state.historyIndex === 0}
          title="Undo (Ctrl+Z)"
        >
          ↶ Undo
          <span className="shortcut-hint">Ctrl+Z</span>
        </button>

        <button
          className="editor-button"
          onClick={handleRedo}
          disabled={state.historyIndex === state.history.length - 1}
          title="Redo (Ctrl+Y)"
        >
          ↷ Redo
          <span className="shortcut-hint">Ctrl+Y</span>
        </button>

        <div style={{ flex: 1 }}></div>

        <button
          className="editor-button primary"
          onClick={handleSave}
          disabled={!state.unsavedChanges || state.isSaving}
          title="Save (Ctrl+S)"
        >
          💾 {state.isSaving ? 'Saving...' : 'Save'}
          <span className="shortcut-hint">Ctrl+S</span>
        </button>
      </div>

      <div className="editor-body">
        <div className="line-numbers">
          {Array.from({ length: lineCount }, (_, i) => (
            <span key={i + 1} className="line-number">
              {i + 1}
            </span>
          ))}
        </div>

        <div className="editor-content">
          <textarea
            ref={editorRef}
            className="editor-textarea"
            value={state.content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyUp={updateEditorStats}
            readOnly={readOnly}
            spellCheck="false"
            wrap="off"
          />
        </div>
      </div>

      <div className="editor-footer">
        <span>UTF-8 • LF • JavaScript</span>
        <div className="cursor-position">
          <span>Line {cursorPosition.line}</span>
          <span>Column {cursorPosition.column}</span>
        </div>
      </div>
    </div>
  );
};

export default FileEditor;
