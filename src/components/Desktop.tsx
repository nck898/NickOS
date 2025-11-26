import { useState } from 'react';
import './Desktop.css';
import type { AppName } from '../App';

interface DesktopIconProps {
  icon: string;
  label: string;
  onClick: () => void;
}

const DesktopIcon = ({ icon, label, onClick }: DesktopIconProps) => {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <div
      className={`desktop-icon ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      onDoubleClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault();
        setIsSelected(!isSelected);
      }}
    >
      <div className="icon-image">{icon}</div>
      <div className="icon-label">{label}</div>
    </div>
  );
};

interface DesktopProps {
  onOpenApp: (appName: AppName) => void;
}

const Desktop = ({ onOpenApp }: DesktopProps) => {
  const icons: { icon: string; label: string; appName: AppName }[] = [
    { icon: '▶️', label: 'TV', appName: 'video' },
    { icon: '🧭', label: 'Safari', appName: 'browser' },
    { icon: '💬', label: 'Chat', appName: 'chat' },
    { icon: '🖼️', label: 'Wallpapers', appName: 'wallpaper' },
  ];

  return (
    <div className="desktop">
      {icons.map((item, index) => (
        <DesktopIcon
          key={index}
          icon={item.icon}
          label={item.label}
          onClick={() => onOpenApp(item.appName)}
        />
      ))}
    </div>
  );
};

export default Desktop;
