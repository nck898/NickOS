import { useState } from 'react';
import './Dock.css';
import type { AppName } from '../App';

interface DockIconProps {
  icon: string;
  label: string;
  onClick: () => void;
  isOpen: boolean;
}

const DockIcon = ({ icon, label, onClick, isOpen }: DockIconProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`dock-icon ${isOpen ? 'open' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        transform: isHovered ? 'scale(1.5) translateY(-10px)' : 'scale(1)',
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <div className="dock-icon-image">{icon}</div>
      {isHovered && <div className="dock-tooltip">{label}</div>}
      {isOpen && <div className="dock-indicator" />}
    </div>
  );
};

interface DockProps {
  openApps: AppName[];
  onOpenApp: (appName: AppName) => void;
}

const Dock = ({ openApps, onOpenApp }: DockProps) => {
  const dockItems: { icon: string; label: string; appName: AppName }[] = [
    { icon: '🗑️', label: 'Trash', appName: 'trash' },
    { icon: '▶️', label: 'TV', appName: 'video' },
    { icon: '🎮', label: 'Pong', appName: 'pong' },
    { icon: '🎵', label: 'FL Studio', appName: 'flstudio' },
    { icon: '🧭', label: 'Safari', appName: 'browser' },
    { icon: '💬', label: 'Chat', appName: 'chat' },
    { icon: '📷', label: 'Photo Studio', appName: 'photostudio' },
    { icon: '📝', label: 'Notes', appName: 'notes' },
    { icon: '🖼️', label: 'Wallpapers', appName: 'wallpaper' },
  ];

  return (
    <div className="dock">
      <div className="dock-container">
        {dockItems.map((item, index) => (
          <DockIcon
            key={index}
            icon={item.icon}
            label={item.label}
            onClick={() => onOpenApp(item.appName)}
            isOpen={openApps.includes(item.appName)}
          />
        ))}
      </div>
    </div>
  );
};

export default Dock;
