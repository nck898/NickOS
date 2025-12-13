import { useState, type ReactNode } from 'react';
import './Desktop.css';
import type { AppName } from '../App';

interface DesktopIconProps {
  icon: ReactNode;
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
  const icons: { icon: ReactNode; label: string; appName: AppName }[] = [
    { icon: '▶️', label: 'Video Player', appName: 'video' },
    { icon: <img src="/icons/internet-explorer.png" alt="Internet Explorer" />, label: 'Internet Explorer', appName: 'browser' },
    { icon: '🖼️', label: 'Wallpaper', appName: 'wallpaper' },
    { icon: '🎧', label: 'Music', appName: 'music' },
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
