import { useState, useEffect } from 'react';
import Window from './Window';
import './WallpaperApp.css';

interface WallpaperAppProps {
  onClose: () => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
  currentWallpaper: string;
  onWallpaperChange: (wallpaper: string) => void;
  theme?: 'light' | 'dark';
}

interface Wallpaper {
  id: string;
  name: string;
  type: 'image';
  extension?: string;
}

const wallpapers: Wallpaper[] = [
  { 
    id: 'landscape',
    name: 'Windows XP - Bliss',
    type: 'image',
    extension: 'webp'
  },
  { 
    id: 'follow',
    name: 'Follow',
    type: 'image',
    extension: 'png'
  },
  { 
    id: 'abstract-blue', 
    name: 'Abstract Blue', 
    type: 'image',
    extension: 'png'
  },
  { 
    id: 'maplestory', 
    name: 'Maplestory',
    type: 'image',
    extension: 'png'
  },
];

const wallpaperVariants: { [key: string]: { light: string; dark?: string } } = {
  'landscape': { light: 'wallpapers/landscape.webp', dark: 'wallpapers/landscape-dark.png' },
  'follow': { light: 'wallpapers/follow.png', dark: 'wallpapers/follow-dark.jpg' },
  'abstract-blue': { light: 'wallpapers/abstract-blue.png', dark: 'wallpapers/abstract-blue-dark.png' },
  'maplestory': { light: 'wallpapers/maplestory.png', dark: 'wallpapers/maplestory-dark.png' },
};

const WallpaperApp = ({ onClose, onMinimize, isMinimized, currentWallpaper, onWallpaperChange, theme = 'light' }: WallpaperAppProps) => {
  const [selectedWallpaper, setSelectedWallpaper] = useState(currentWallpaper);

  useEffect(() => {
    setSelectedWallpaper(currentWallpaper);
  }, [currentWallpaper]);

  const handleSelectWallpaper = (wallpaperId: string) => {
    setSelectedWallpaper(wallpaperId);
    onWallpaperChange(wallpaperId);
  };

  const buildPreviewCandidates = (wallpaper: Wallpaper) => {
    const variant = wallpaperVariants[wallpaper.id];
    const exts = ['png', 'jpg', 'jpeg', 'webp'];
    const baseExt = wallpaper.extension || 'jpg';
    const themedBase = theme === 'dark' ? variant?.dark : variant?.light;
    const candidates: string[] = [];
    if (themedBase) candidates.push(themedBase);
    candidates.push(`wallpapers/${wallpaper.id}.${baseExt}`);
    exts.forEach((ext) => candidates.push(`wallpapers/${wallpaper.id}-${theme}.${ext}`));
    exts.forEach((ext) => candidates.push(`wallpapers/${wallpaper.id}.${ext}`));
    return Array.from(new Set(candidates));
  };

  const getWallpaperPreview = (wallpaper: Wallpaper) => {
    const candidates = buildPreviewCandidates(wallpaper);
    const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      const nextIndex = Number(img.dataset.idx || '0') + 1;
      if (nextIndex < candidates.length) {
        img.dataset.idx = String(nextIndex);
        img.src = `/${candidates[nextIndex]}`;
      } else {
        img.style.display = 'none';
      }
    };

    return (
      <div className="wallpaper-preview-image" key={`${wallpaper.id}-${theme}`}>
        <img
          src={`/${candidates[0]}`}
          data-idx="0"
          alt={wallpaper.name}
          onError={handleError}
        />
      </div>
    );
  };

  return (
    <Window title="Wallpapers" icon="🖼️" onClose={onClose} onMinimize={onMinimize} isMinimized={isMinimized} initialWidth={760} initialHeight={640}>
      <div className="wallpaper-app">
        <div className="wallpaper-header">
          <h3>Select a Wallpaper</h3>
          <p>Choose from available wallpapers to customize your desktop</p>
        </div>
        <div className="wallpaper-grid">
          {wallpapers.map((wallpaper) => (
            <div
              key={wallpaper.id}
              className={`wallpaper-item ${selectedWallpaper === wallpaper.id ? 'selected' : ''}`}
              onClick={() => handleSelectWallpaper(wallpaper.id)}
            >
              <div className="wallpaper-preview">
                {getWallpaperPreview(wallpaper)}
              </div>
              <div className="wallpaper-name">{wallpaper.name}</div>
              {selectedWallpaper === wallpaper.id && (
                <div className="wallpaper-check">✓</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Window>
  );
};

export default WallpaperApp;
