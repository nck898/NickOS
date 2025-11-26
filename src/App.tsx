import { useState, useEffect } from 'react';
import TopBar from './components/TopBar';
import Desktop from './components/Desktop';
import Dock from './components/Dock';
import AboutModal from './components/AboutModal';
import CursorTrail from './components/CursorTrail';
import TrashApp from './components/apps/TrashApp';
import VideoApp from './components/apps/VideoApp';
import PongApp from './components/apps/PongApp';
import FLStudioApp from './components/apps/FLStudioApp';
import WallpaperApp from './components/apps/WallpaperApp';
import BrowserApp from './components/apps/BrowserApp';
import PhotoStudioApp from './components/apps/PhotoStudioApp';
import ChatApp, { generateNickReply } from './components/apps/ChatApp';
import type { ChatMessage } from './components/apps/ChatApp';
import NoteApp from './components/apps/NoteApp';
import WeatherWidget from './components/WeatherWidget';
import PictureFrameWidget from './components/PictureFrameWidget';
import './App.css';

export type AppName = 'trash' | 'video' | 'pong' | 'flstudio' | 'wallpaper' | 'browser' | 'photostudio' | 'chat' | 'notes';

// Wallpaper variants for light/dark; add your dark-mode assets in /public with these names
const wallpaperVariants: { [key: string]: { light: string; dark?: string } } = {
  'landscape': { light: 'landscape.png', dark: 'landscape-dark.png' },
  'snow-leopard': { light: 'snow-leopard.png', dark: 'snow-leopard-dark.png' },
  'abstract-blue': { light: 'abstract-blue.png', dark: 'abstract-blue-dark.png' },
};

function App() {
  const [openApps, setOpenApps] = useState<AppName[]>([]);
  const [showAbout, setShowAbout] = useState(false);
  const [currentWallpaper, setCurrentWallpaper] = useState<string>('landscape');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [minimizedApps, setMinimizedApps] = useState<Set<AppName>>(new Set());
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Apply wallpaper on mount and when it or theme changes
    applyWallpaper(currentWallpaper, theme);
  }, [currentWallpaper, theme]);

  const buildWallpaperCandidates = (wallpaperId: string, activeTheme: 'light' | 'dark') => {
    const variant = wallpaperVariants[wallpaperId];
    const primary = activeTheme === 'dark' ? variant?.dark ?? variant?.light : variant?.light;
    const fallbackTheme = activeTheme === 'dark' ? variant?.light : undefined;

    // Generate fallbacks for both extensions and -dark suffix
    const baseExts = ['png', 'jpg', 'jpeg'];
    const generated = [
      ...baseExts.map((ext) => `${wallpaperId}${activeTheme === 'dark' ? '-dark' : ''}.${ext}`),
      ...baseExts.map((ext) => `${wallpaperId}.${ext}`),
    ];

    const candidates = [primary, fallbackTheme, ...generated].filter(Boolean) as string[];
    return Array.from(new Set(candidates)).map((file) => `/${file}`);
  };

  const applyWallpaper = (wallpaperId: string, activeTheme: 'light' | 'dark') => {
    const body = document.body;
    const paths = buildWallpaperCandidates(wallpaperId, activeTheme);

    body.style.background = '';
    body.style.backgroundImage = paths.map((p) => `url(${p})`).join(', ');
    // Slight zoom to obscure corner watermarks
    body.style.backgroundSize = '110%';
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

  return (
    <div className="app-container">
      <CursorTrail />
      <WeatherWidget />
      <PictureFrameWidget />
      <TopBar onShowAbout={() => setShowAbout(true)} theme={theme} onToggleTheme={toggleTheme} />
      <div className="desktop-container">
        <Desktop onOpenApp={handleOpenApp} />
        {openApps.map((appName) => {
          switch (appName) {
            case 'trash':
              return <TrashApp key={appName} onClose={() => handleCloseApp(appName)} onMinimize={() => handleMinimize(appName)} isMinimized={minimizedApps.has(appName)} />;
            case 'video':
              return <VideoApp key={appName} onClose={() => handleCloseApp(appName)} onMinimize={() => handleMinimize(appName)} isMinimized={minimizedApps.has(appName)} />;
            case 'pong':
              return <PongApp key={appName} onClose={() => handleCloseApp(appName)} onMinimize={() => handleMinimize(appName)} isMinimized={minimizedApps.has(appName)} />;
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
