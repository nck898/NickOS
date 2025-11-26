import { useEffect, useState } from 'react';
import Window from './apps/Window';
import './PictureFrameWidget.css';

const PictureFrameWidget = () => {
  const [visible, setVisible] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const attr = document.documentElement.getAttribute('data-theme');
    return attr === 'dark' ? 'dark' : 'light';
  });

  const [position, setPosition] = useState({ x: 18, y: 200 });

  const handlePositionChange = (pos: { x: number; y: number }) => {
    setPosition(pos);
  };

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const attr = document.documentElement.getAttribute('data-theme');
      setTheme(attr === 'dark' ? 'dark' : 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const imageSrc = theme === 'dark' ? '/picture-frame-dark.png' : '/picture-frame.jpg';

  if (!visible) return null;

  return (
    <Window
      title="Picture Frame"
      icon="🖼️"
      onClose={() => setVisible(false)}
      showMinimize={false}
      initialWidth={220}
      initialHeight={220}
      initialX={position.x}
      initialY={position.y}
      onPositionChange={handlePositionChange}
      className="picture-frame-window"
    >
      <div className="picture-frame">
        <img src={imageSrc} alt="Nick and Emily selfie" className="frame-image" />
      </div>
    </Window>
  );
};

export default PictureFrameWidget;
