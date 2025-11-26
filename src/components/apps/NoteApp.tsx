import { useState } from 'react';
import Window from './Window';
import './NoteApp.css';

interface Note {
  id: string;
  title: string;
  content: string;
  updated: number;
}

interface NoteAppProps {
  onClose: () => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
}

const NoteApp = ({ onClose, onMinimize, isMinimized }: NoteAppProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeNote = notes.find((n) => n.id === activeId) || null;

  const createNote = () => {
    const id = crypto.randomUUID();
    const newNote: Note = { id, title: 'Untitled', content: '', updated: Date.now() };
    setNotes([newNote, ...notes]);
    setActiveId(id);
  };

  const updateNote = (fields: Partial<Note>) => {
    if (!activeNote) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNote.id ? { ...n, ...fields, updated: Date.now() } : n
      )
    );
  };

  return (
    <Window
      title="Notes"
      icon="📝"
      onClose={onClose}
      onMinimize={onMinimize}
      isMinimized={isMinimized}
      initialWidth={900}
      initialHeight={600}
    >
      <div className="notes-app">
        <div className="notes-sidebar">
          <div className="notes-header">
            <h3>Notes</h3>
            <button className="note-btn" onClick={createNote}>New</button>
          </div>
          <div className="note-list">
            {notes.length === 0 && <div className="empty-notes">No notes yet</div>}
            {notes.map((note) => (
              <div
                key={note.id}
                className={`note-list-item ${note.id === activeId ? 'active' : ''}`}
                onClick={() => setActiveId(note.id)}
              >
                <div className="note-title">{note.title || 'Untitled'}</div>
                <div className="note-updated">
                  {new Date(note.updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="notes-editor">
          {activeNote ? (
            <>
              <input
                className="note-title-input"
                value={activeNote.title}
                onChange={(e) => updateNote({ title: e.target.value })}
                placeholder="Title"
              />
              <div className="note-toolbar">
                <button onClick={() => document.execCommand('bold')}>B</button>
                <button onClick={() => document.execCommand('italic')}>I</button>
                <button onClick={() => document.execCommand('underline')}>U</button>
                <button onClick={() => document.execCommand('insertUnorderedList')}>• List</button>
              </div>
              <div
                className="note-content"
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => updateNote({ content: (e.target as HTMLDivElement).innerHTML })}
                dangerouslySetInnerHTML={{ __html: activeNote.content }}
              />
            </>
          ) : (
            <div className="empty-editor">Select or create a note to start</div>
          )}
        </div>
      </div>
    </Window>
  );
};

export default NoteApp;
