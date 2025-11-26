import Window from './Window';
import './TrashApp.css';

interface TrashAppProps {
  onClose: () => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
  onRestore?: () => void;
}

const TrashApp = ({ onClose, onMinimize, isMinimized }: TrashAppProps) => {
  return (
    <Window title="Trash" icon="🗑️" onClose={onClose} onMinimize={onMinimize} isMinimized={isMinimized} initialWidth={540} initialHeight={430}>
      <div className="trash-app">
        <div className="trash-icon-large">🗑️</div>
        <h2>Trash</h2>
        <p className="trash-message">Your trash contains:</p>
        <div className="trash-items">
          <p aria-label="smiling poop">💩</p>
        </div>
        <div className="trash-actions">
          <button
            className="retro-button"
            onClick={() => alert("Ha tricked ya. You'll never empty out the poop")}
          >
            Empty Trash
          </button>
        </div>
      </div>
    </Window>
  );
};

export default TrashApp;
