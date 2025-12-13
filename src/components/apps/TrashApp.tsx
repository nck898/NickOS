import { useState } from 'react';
import Window from './Window';
import './TrashApp.css';

interface TrashAppProps {
  onClose: () => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
  onRestore?: () => void;
}

const INITIAL_POOPS = 15;

const TrashApp = ({ onClose, onMinimize, isMinimized }: TrashAppProps) => {
  const [poopsCount, setPoopsCount] = useState(INITIAL_POOPS);

  const handleEmpty = () => {
    if (poopsCount <= 0) return;

    const nextCount = poopsCount - 1;
    setPoopsCount(nextCount);

    if (nextCount === 0) {
      alert('thanks for getting rid of all the trash!');
    }
  };

  return (
    <Window
      title="Trash"
      icon="🗑️"
      onClose={onClose}
      onMinimize={onMinimize}
      isMinimized={isMinimized}
      initialWidth={760}
      initialHeight={540}
    >
      <div className="trash-app">
        <div className="trash-grid" aria-label="trash grid">
          {Array.from({ length: poopsCount }).map((_, idx) => (
            <span key={idx} className="trash-poop" role="img" aria-label="poop">
              💩
            </span>
          ))}
        </div>
        <div className="trash-actions">
          <button className="retro-button" onClick={handleEmpty} disabled={poopsCount === 0}>
            Empty Trash
          </button>
        </div>
      </div>
    </Window>
  );
};

export default TrashApp;
