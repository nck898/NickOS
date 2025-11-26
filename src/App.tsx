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
import './App.css';

export type AppName = 'trash' | 'video' | 'pong' | 'flstudio' | 'wallpaper' | 'browser' | 'photostudio' | 'chat';

// Wallpaper file extensions mapping
const wallpaperExtensions: { [key: string]: string } = {
  'landscape': 'jpg',
  'snow-leopard': 'jpg',
  'abstract-blue': 'png',
};

function App() {
  const [openApps, setOpenApps] = useState<AppName[]>([]);
  const [showAbout, setShowAbout] = useState(false);
  const [currentWallpaper, setCurrentWallpaper] = useState<string>('landscape');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    // Apply wallpaper on mount and when it changes
    applyWallpaper(currentWallpaper);
  }, [currentWallpaper]);

  const applyWallpaper = (wallpaperId: string) => {
    const body = document.body;
    // Image wallpapers - handle different file extensions
    const extension = wallpaperExtensions[wallpaperId] || 'jpg';
    body.style.background = '';
    body.style.backgroundImage = `url(/${wallpaperId}.${extension})`;
    body.style.backgroundSize = 'cover';
    body.style.backgroundPosition = 'center center';
    body.style.backgroundAttachment = 'fixed';
    body.style.backgroundRepeat = 'no-repeat';
  };

  const handleOpenApp = (appName: AppName) => {
    if (!openApps.includes(appName)) {
      setOpenApps([...openApps, appName]);
    }
  };

  const handleCloseApp = (appName: AppName) => {
    setOpenApps(openApps.filter(app => app !== appName));
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

  return (
    <div className="app-container">
      <CursorTrail />
      <TopBar onShowAbout={() => setShowAbout(true)} />
      <div className="desktop-container">
        <Desktop onOpenApp={handleOpenApp} />
        {openApps.map((appName) => {
          switch (appName) {
            case 'trash':
              return <TrashApp key={appName} onClose={() => handleCloseApp(appName)} />;
            case 'video':
              return <VideoApp key={appName} onClose={() => handleCloseApp(appName)} />;
            case 'pong':
              return <PongApp key={appName} onClose={() => handleCloseApp(appName)} />;
            case 'flstudio':
              return <FLStudioApp key={appName} onClose={() => handleCloseApp(appName)} />;
            case 'wallpaper':
              return (
                <WallpaperApp
                  key={appName}
                  onClose={() => handleCloseApp(appName)}
                  currentWallpaper={currentWallpaper}
                  onWallpaperChange={handleWallpaperChange}
                />
              );
            case 'browser':
              return <BrowserApp key={appName} onClose={() => handleCloseApp(appName)} />;
            case 'photostudio':
              return <PhotoStudioApp key={appName} onClose={() => handleCloseApp(appName)} />;
            case 'chat':
              return (
                <ChatApp
                  key={appName}
                  onClose={() => handleCloseApp(appName)}
                  messages={chatMessages}
                  onSend={handleSendChat}
                />
              );
            default:
              return null;
          }
        })}
      </div>
      <Dock openApps={openApps} onOpenApp={handleOpenApp} />
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </div>
  );
}

export default App;
