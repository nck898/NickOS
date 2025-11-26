import Window from './Window';
import './TrashApp.css';

interface TrashAppProps {
  onClose: () => void;
}

const TrashApp = ({ onClose }: TrashAppProps) => {
  return (
    <Window title="Trash" icon="🗑️" onClose={onClose} initialWidth={500} initialHeight={400}>
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
