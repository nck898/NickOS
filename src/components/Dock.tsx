import { useRef, useState, type ReactNode, useCallback, type MouseEvent as ReactMouseEvent } from 'react';
import './Dock.css';
import type { AppName } from '../App';

interface DockIconProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  isOpen: boolean;
  scale: number;
  lift: number;
  setRef: (node: HTMLDivElement | null) => void;
}

const DockIcon = ({ icon, label, onClick, isOpen, scale, lift, setRef }: DockIconProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={setRef}
      className={`dock-icon ${isOpen ? 'open' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        transform: `translateY(${lift}px) scale(${scale})`,
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
  const dockItems: { icon: ReactNode; label: string; appName: AppName }[] = [
    { icon: '🗑️', label: 'Trash', appName: 'trash' },
    { icon: '▶️', label: 'Video Player', appName: 'video' },
    { icon: '🎮', label: 'Games', appName: 'game' },
    { icon: '🎵', label: 'FL Studio', appName: 'flstudio' },
    { icon: '🎧', label: 'Music', appName: 'music' },
    { icon: <img src="/icons/internet-explorer.png" alt="Internet Explorer" />, label: 'Internet Explorer', appName: 'browser' },
    { icon: '📷', label: 'Photo Studio', appName: 'photostudio' },
    { icon: '📝', label: 'Notes', appName: 'notes' },
    { icon: '🖼️', label: 'Wallpaper', appName: 'wallpaper' },
  ];

  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    setMouseX(e.clientX);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseX(null);
    setIsHovering(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const computeTransform = useCallback(
    (index: number) => {
      if (mouseX === null) return { scale: 1, lift: 0 };
      const iconEl = iconRefs.current[index];
      const rect = iconEl?.getBoundingClientRect();
      if (!rect) return { scale: 1, lift: 0 };

      const centerX = rect.left + rect.width / 2;
      const distance = Math.abs(mouseX - centerX);
      const influenceRadius = 110;
      const peakScale = 2;
      const falloff = Math.max(0, 1 - distance / influenceRadius);
      const eased = Math.pow(falloff, 2.2);
      const scale = 1 + eased * (peakScale - 1);
      const lift = -14 * eased;
      return { scale, lift };
    },
    [mouseX]
  );

  const transforms = dockItems.map((_, idx) => computeTransform(idx));

  return (
    <div className="dock">
      <div
        className={`dock-container ${isHovering ? 'expanded' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
      >
        {dockItems.map((item, index) => (
          <DockIcon
            key={index}
            icon={item.icon}
            label={item.label}
            onClick={() => onOpenApp(item.appName)}
            isOpen={openApps.includes(item.appName)}
            scale={transforms[index].scale}
            lift={transforms[index].lift}
            setRef={(node) => {
              iconRefs.current[index] = node;
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Dock;
