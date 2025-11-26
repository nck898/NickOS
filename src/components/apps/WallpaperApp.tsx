import { useState, useEffect } from 'react';
import Window from './Window';
import './WallpaperApp.css';

interface WallpaperAppProps {
  onClose: () => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
  currentWallpaper: string;
  onWallpaperChange: (wallpaper: string) => void;
}

interface Wallpaper {
  id: string;
  name: string;
  type: 'image';
  preview?: string;
  extension?: string;
}

const wallpapers: Wallpaper[] = [
  { 
    id: 'landscape', 
    name: 'Green Hills Landscape', 
    type: 'image',
    preview: '🌄',
    extension: 'jpg'
  },
  { 
    id: 'snow-leopard', 
    name: 'Snow Leopard', 
    type: 'image',
    preview: '🐆',
    extension: 'jpg'
  },
  { 
    id: 'abstract-blue', 
    name: 'Abstract Blue', 
    type: 'image',
    preview: '💙',
    extension: 'png'
  },
];

const WallpaperApp = ({ onClose, onMinimize, isMinimized, currentWallpaper, onWallpaperChange }: WallpaperAppProps) => {
  const [selectedWallpaper, setSelectedWallpaper] = useState(currentWallpaper);

  useEffect(() => {
    setSelectedWallpaper(currentWallpaper);
  }, [currentWallpaper]);

  const handleSelectWallpaper = (wallpaperId: string) => {
    setSelectedWallpaper(wallpaperId);
    onWallpaperChange(wallpaperId);
  };

  const getWallpaperPreview = (wallpaper: Wallpaper) => {
    const extension = wallpaper.extension || 'jpg';
    return (
      <div className="wallpaper-preview-image">
        <img 
          src={`/${wallpaper.id}.${extension}`} 
          alt={wallpaper.name}
          onError={(e) => {
            // Fallback if image doesn't exist
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="wallpaper-preview-placeholder">
          {wallpaper.preview}
        </div>
      </div>
    );
  };

  return (
    <Window title="Wallpapers" icon="🖼️" onClose={onClose} onMinimize={onMinimize} isMinimized={isMinimized} initialWidth={700} initialHeight={600}>
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
        <div className="wallpaper-info">
          <p className="wallpaper-note">
            <strong>Note:</strong> For image wallpapers, place your images in the <code>public</code> folder with these names:
          </p>
          <ul>
            <li><code>landscape.jpg</code> - Green Hills Landscape</li>
            <li><code>snow-leopard.jpg</code> - Snow Leopard</li>
            <li><code>abstract-blue.png</code> - Abstract Blue</li>
          </ul>
        </div>
      </div>
    </Window>
  );
};

export default WallpaperApp;
