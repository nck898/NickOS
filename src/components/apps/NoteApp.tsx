import { useEffect, useRef, useState } from 'react';
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
  const [initialData] = useState(() => {
    const now = Date.now();
    const recipeId = crypto.randomUUID();
    const storyId = crypto.randomUUID();
    const notes: Note[] = [
      {
        id: recipeId,
        title: 'Donkatsu Recipe',
        content: `
          <h3>Donkatsu (Korean Pork Cutlet)</h3>
          <p>Crispy, golden, and comforting. Serves 2.</p>
          <ul>
            <li>2 boneless pork loin chops, 1/2-inch thick</li>
            <li>Salt, black pepper, and garlic powder to season</li>
            <li>1/2 cup flour</li>
            <li>1 egg, beaten with 1 tbsp milk</li>
            <li>1 cup panko breadcrumbs</li>
            <li>Neutral oil for shallow frying</li>
          </ul>
          <p><strong>Sauce:</strong> 3 tbsp ketchup, 2 tbsp Worcestershire, 1 tbsp soy sauce, 1 tsp sugar, pinch black pepper. Whisk together.</p>
          <ol>
            <li>Pound chops to even thickness; season both sides.</li>
            <li>Dredge in flour, dip in egg, then coat in panko. Press gently.</li>
            <li>Heat 1/2 inch of oil to ~350°F (175°C). Fry 3-4 min per side until deep golden and 145°F inside. Drain on rack.</li>
            <li>Rest 2 minutes, slice into strips, drizzle or serve with sauce on the side.</li>
            <li>Serve with shredded cabbage, rice, and a lemon wedge.</li>
          </ol>
        `,
        updated: now,
      },
      {
        id: storyId,
        title: 'Ninja Squirrel & Wizard Giraffe',
        content: `
          <p>In the neon canopy above Pixel Park, a ninja squirrel named Miso darted from branch to branch, silent as a cursor blinking on a dark screen. Below, a wizard giraffe named Loomis practiced spells that bent starlight into vinyl grooves. They were opposites in height, stride, and vibe, but fate was DJing a set neither expected.</p>
          <p>One dusk, the city amps blew out. The block went silent, and the community hip hop jam—the one that brought every creature together—was on the verge of cancellation. Miso, who lived for rhythm, panicked; Loomis, who loved impossible problems, tilted his hat and squinted at the sky.</p>
          <p>“Power’s gone,” said Miso, landing on Loomis’s shoulder. “No beat, no bars.”</p>
          <p>“We make our own,” Loomis replied, tapping his staff. He summoned a spell to sync heartbeats with moonlight, but it fizzled. Miso clicked his tongue. “You’re thinking too tall,” he joked. “Keep it grounded.” Loomis laughed, and for a second the park felt less dark.</p>
          <p>Miso taught Loomis a ninja rhythm: palm on chest, tail flick, heel tap—simple, percussive. Loomis added a bassy hum that rippled through his long frame. Together, they layered a loop, each round louder, until the trees picked up the pulse. Fireflies blinked in time; distant pigeons cooed a harmony.</p>
          <p>Neighbors emerged, curious. Kids clapped; raccoons shuffled; even the aloof alley cats nodded. Loomis arced a minor spell, scattering sparks that spun like vinyl, while Miso scratched rhythms on bark, inventing a new kind of break. The jam restarted without a single cable. Hip hop lived in their bodies, not in the grid.</p>
          <p>By midnight the park was glowing. The crowd saw a ninja squirrel atop a wizard giraffe, both sweating, laughing, and looping the beat like old friends. They had built a bridge between ground and sky, paws and hooves, magic and motion. The power of friendship, they realized, was the cleanest sample: it needed no permission, no outlet, and no remix to matter.</p>
          <p>Their beat echoed past the park, bouncing off glass towers and alley murals. A passing cyclist slowed to match the rhythm; a subway busker sampled the echo and sent it back topside. The city became a giant turntable, each block scratching a reply. Miso and Loomis listened, hearing their own pulse amplified by strangers. It felt like family.</p>
          <p>When dawn pinked the skyline, the jam softened into a warm fade-out. Loomis lowered Miso to the ground and handed him a tiny crystal. “A pocket loop,” he said. “For the next blackout.” Miso grinned and tucked it into his headband. They bumped fist to hoof.</p>
          <p>They parted ways as the sun climbed, promising to meet again when the city needed a beat. The power grid flickered back, unnoticed. Friendship had already rebooted everything.</p>
        `,
        updated: now,
      },
    ];
    return { notes, firstId: recipeId };
  });
  const [notes, setNotes] = useState<Note[]>(initialData.notes);
  const [activeId, setActiveId] = useState<string | null>(initialData.firstId);
  const editorRef = useRef<HTMLDivElement | null>(null);

  const activeNote = notes.find((n) => n.id === activeId) || null;

  // Default to first note on load if none selected
  useEffect(() => {
    if (!activeId && notes.length > 0) {
      setActiveId(notes[0].id);
    }
  }, [activeId, notes]);

  // Sync editor contents only when switching notes to avoid caret jumps and keep undo stack intact
  useEffect(() => {
    if (editorRef.current && activeNote) {
      const current = editorRef.current.innerHTML;
      if (current !== activeNote.content) {
        editorRef.current.innerHTML = activeNote.content;
      }
    }
  }, [activeNote?.id, activeNote?.content]);

  const createNote = () => {
    const id = crypto.randomUUID();
    const newNote: Note = { id, title: 'Untitled', content: '', updated: Date.now() };
    setNotes((prev) => [newNote, ...prev]);
    setActiveId(id);
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
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
                ref={editorRef}
                className="note-content"
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => updateNote({ content: (e.target as HTMLDivElement).innerHTML })}
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
