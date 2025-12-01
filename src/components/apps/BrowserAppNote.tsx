import './BrowserAppNote.css';

type BrowserAppNoteProps = {
  visible: boolean;
};

const BrowserAppNote = ({ visible }: BrowserAppNoteProps) => {
  if (!visible) return null;
  return (
    <div className="browser-note">
      NickOS-ception :D
    </div>
  );
};

export default BrowserAppNote;
