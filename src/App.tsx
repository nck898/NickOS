import { useState, useEffect } from 'react';
import TopBar from './components/TopBar';
import Desktop from './components/Desktop';
import Dock from './components/Dock';
import AboutModal from './components/AboutModal';
import CursorTrail from './components/CursorTrail';
import TrashApp from './components/apps/TrashApp';
import VideoApp from './components/apps/VideoApp';
import GameApp from './components/apps/GameApp';
import FLStudioApp from './components/apps/FLStudioApp';
import WallpaperApp from './components/apps/WallpaperApp';
import BrowserApp from './components/apps/BrowserApp';
import PhotoStudioApp from './components/apps/PhotoStudioApp';
import ChatApp, { generateNickReply } from './components/apps/ChatApp';
import type { ChatMessage } from './components/apps/ChatApp';
import NoteApp from './components/apps/NoteApp';
import WeatherWidget from './components/WeatherWidget';
import PictureFrameWidget from './components/PictureFrameWidget';
import MusicPlayerApp from './components/apps/MusicPlayerApp';
import PetWidget from './components/PetWidget';
import './App.css';

export type AppName = 'trash' | 'video' | 'game' | 'flstudio' | 'wallpaper' | 'browser' | 'photostudio' | 'chat' | 'notes' | 'music';

// Wallpaper variants for light/dark; add your dark-mode assets in /public with these names
const wallpaperVariants: { [key: string]: { light: string; dark?: string } } = {
  'landscape': { light: 'wallpapers/landscape.jpg', dark: 'wallpapers/landscape-dark.png' },
  'snow-leopard': { light: 'wallpapers/snow-leopard.jpg', dark: 'wallpapers/snow-leopard-dark.png' },
  'abstract-blue': { light: 'wallpapers/abstract-blue.png', dark: 'wallpapers/abstract-blue-dark.png' },
  'maplestory': { light: 'wallpapers/maplestory.png', dark: 'wallpapers/maplestory-dark.png' },
};

function App() {
  const [openApps, setOpenApps] = useState<AppName[]>(['music']);
  const [showAbout, setShowAbout] = useState(false);
  const [currentWallpaper, setCurrentWallpaper] = useState<string>('landscape');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [minimizedApps, setMinimizedApps] = useState<Set<AppName>>(new Set());
  const getInitialTheme = (): 'light' | 'dark' => {
    if (typeof document === 'undefined') return 'light';
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'dark' || attr === 'light') return attr;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nickos-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Apply wallpaper on mount and when it or theme changes
    applyWallpaper(currentWallpaper, theme);
  }, [currentWallpaper, theme]);

  useEffect(() => {
    const handleResize = () => applyWallpaper(currentWallpaper, theme);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentWallpaper, theme]);

  const buildWallpaperCandidates = (wallpaperId: string, activeTheme: 'light' | 'dark') => {
    const variant = wallpaperVariants[wallpaperId];
    const baseExts = ['png', 'jpg', 'jpeg'];

    if (activeTheme === 'dark') {
      const primary = variant?.dark;
      const generatedDark = baseExts.map((ext) => `wallpapers/${wallpaperId}-dark.${ext}`);
      // Only fall back to light assets if no dark filenames exist at all
      const generatedLight = primary ? [] : baseExts.map((ext) => `wallpapers/${wallpaperId}.${ext}`);
      const candidates = [primary, ...generatedDark, ...generatedLight].filter(Boolean) as string[];
      return Array.from(new Set(candidates)).map((file) => `/${file}`);
    }

    // Light mode: prefer light assets and neutral names only
    const primary = variant?.light;
    const generatedLight = baseExts.map((ext) => `wallpapers/${wallpaperId}.${ext}`);
    const candidates = [primary, ...generatedLight].filter(Boolean) as string[];
    return Array.from(new Set(candidates)).map((file) => `/${file}`);
  };

  const applyWallpaper = (wallpaperId: string, activeTheme: 'light' | 'dark') => {
    const body = document.body;
    const paths = buildWallpaperCandidates(wallpaperId, activeTheme);
    // Aggressive zoom on narrow viewports so the image fills the entire screen
    const zoomSize = window.innerWidth <= 900 ? '200%' : '110%';

    body.style.background = '';
    body.style.backgroundImage = paths.map((p) => `url(${p})`).join(', ');
    // Slight zoom to obscure corner watermarks; stronger zoom on mobile
    body.style.backgroundSize = zoomSize;
    body.style.backgroundPosition = 'center center';
    body.style.backgroundAttachment = 'fixed';
    body.style.backgroundRepeat = 'no-repeat';
  };

  const handleOpenApp = (appName: AppName) => {
    setMinimizedApps((prev) => {
      const next = new Set(prev);
      next.delete(appName);
      return next;
    });
    if (!openApps.includes(appName)) setOpenApps([...openApps, appName]);
  };

  const handleCloseApp = (appName: AppName) => {
    setOpenApps(openApps.filter(app => app !== appName));
    setMinimizedApps((prev) => {
      const next = new Set(prev);
      next.delete(appName);
      return next;
    });
  };

  const handleMinimize = (appName: AppName) => {
    setMinimizedApps((prev) => new Set(prev).add(appName));
  };

  const handleRestore = (appName: AppName) => {
    setMinimizedApps((prev) => {
      const next = new Set(prev);
      next.delete(appName);
      return next;
    });
  };

  const handleWallpaperChange = (wallpaperId: string) => {
    setCurrentWallpaper(wallpaperId);
  };

  const handleSendChat = (text: string) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text,
      timestamp: Date.now(),
    };
    const nickMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'nick',
      text: generateNickReply(text, [...chatMessages, userMsg]),
      timestamp: Date.now(),
    };
    setChatMessages((prev) => [...prev, userMsg, nickMsg]);
  };

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  useEffect(() => {
    document.body.classList.remove('no-theme-transition');
  }, []);

  return (
    <div className="app-container">
      <CursorTrail />
      <WeatherWidget />
      <PictureFrameWidget />
      <PetWidget />
      <TopBar onShowAbout={() => setShowAbout(true)} theme={theme} onToggleTheme={toggleTheme} />
      <div className="desktop-container">
        <Desktop onOpenApp={handleOpenApp} />
        {openApps.map((appName) => {
          switch (appName) {
            case 'trash':
              return <TrashApp key={appName} onClose={() => handleCloseApp(appName)} onMinimize={() => handleMinimize(appName)} isMinimized={minimizedApps.has(appName)} />;
            case 'video':
              return <VideoApp key={appName} onClose={() => handleCloseApp(appName)} onMinimize={() => handleMinimize(appName)} isMinimized={minimizedApps.has(appName)} />;
            case 'game':
              return <GameApp key={appName} onClose={() => handleCloseApp(appName)} onMinimize={() => handleMinimize(appName)} isMinimized={minimizedApps.has(appName)} />;
            case 'flstudio':
              return <FLStudioApp key={appName} onClose={() => handleCloseApp(appName)} onMinimize={() => handleMinimize(appName)} isMinimized={minimizedApps.has(appName)} />;
            case 'wallpaper':
              return (
                <WallpaperApp
                  key={appName}
                  onClose={() => handleCloseApp(appName)}
                  onMinimize={() => handleMinimize(appName)}
                  isMinimized={minimizedApps.has(appName)}
                  currentWallpaper={currentWallpaper}
                  onWallpaperChange={handleWallpaperChange}
                  theme={theme}
                />
              );
            case 'browser':
              return <BrowserApp key={appName} onClose={() => handleCloseApp(appName)} onMinimize={() => handleMinimize(appName)} isMinimized={minimizedApps.has(appName)} />;
            case 'photostudio':
              return <PhotoStudioApp key={appName} onClose={() => handleCloseApp(appName)} onMinimize={() => handleMinimize(appName)} isMinimized={minimizedApps.has(appName)} />;
            case 'chat':
              return (
                <ChatApp
                  key={appName}
                  onClose={() => handleCloseApp(appName)}
                  onMinimize={() => handleMinimize(appName)}
                  isMinimized={minimizedApps.has(appName)}
                  messages={chatMessages}
                  onSend={handleSendChat}
                />
              );
            case 'notes':
              return <NoteApp key={appName} onClose={() => handleCloseApp(appName)} onMinimize={() => handleMinimize(appName)} isMinimized={minimizedApps.has(appName)} />;
            case 'music':
              return (
                <MusicPlayerApp
                  key={appName}
                  onClose={() => handleCloseApp(appName)}
                  onMinimize={() => handleMinimize(appName)}
                  isMinimized={minimizedApps.has(appName)}
                  initialX={
                    typeof window !== 'undefined'
                      ? Math.max(12, window.innerWidth - 300 - 24)
                      : 100
                  }
                  initialY={
                    typeof window !== 'undefined'
                      ? Math.max(12, window.innerHeight - 520 - 96)
                      : 100
                  }
                />
              );
            default:
              return null;
          }
        })}
      </div>
      <Dock openApps={openApps} onOpenApp={handleOpenApp} />
      {minimizedApps.size > 0 && (
        <div className="minimized-tray">
          {[...minimizedApps].map((app) => (
            <button key={app} className="tray-chip" onClick={() => handleRestore(app)}>
              {app}
            </button>
          ))}
        </div>
      )}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </div>
  );
}

export default App;
