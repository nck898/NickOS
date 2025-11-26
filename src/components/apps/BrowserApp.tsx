import { useEffect, useRef, useState } from 'react';
import Window from './Window';
import './BrowserApp.css';

interface BrowserAppProps {
  onClose: () => void;
}

type HistoryEntry = {
  url: string;
};

const DEFAULT_URL = 'https://www.nyan.cat/';

const BrowserApp = ({ onClose }: BrowserAppProps) => {
  const [address, setAddress] = useState(DEFAULT_URL);
  const [currentUrl, setCurrentUrl] = useState(DEFAULT_URL);
  const [history, setHistory] = useState<HistoryEntry[]>([{ url: DEFAULT_URL }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setIsLoading(true);
  }, [currentUrl]);

  const navigateTo = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    // Basic guard against javascript: URLs
    if (trimmed.toLowerCase().startsWith('javascript:')) return;

    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const newHistory = history.slice(0, historyIndex + 1).concat({ url: normalized });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentUrl(normalized);
    setAddress(normalized);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(history[newIndex].url);
      setAddress(history[newIndex].url);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(history[newIndex].url);
      setAddress(history[newIndex].url);
    }
  };

  const reload = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = currentUrl;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(address);
  };

  const bookmarks = [
    { label: 'Nyan Cat', url: 'https://www.nyan.cat/' },
    { label: 'Wikipedia', url: 'https://wikipedia.org' },
    { label: 'Example', url: 'https://example.com' },
  ];

  return (
    <Window
      title="Safari"
      icon="🧭"
      onClose={onClose}
      initialWidth={960}
      initialHeight={720}
    >
      <div className="browser-shell">
        <div className="browser-toolbar">
          <div className="toolbar-group nav-buttons">
            <button className="toolbar-btn" onClick={goBack} disabled={historyIndex === 0}>
              ‹
            </button>
            <button className="toolbar-btn" onClick={goForward} disabled={historyIndex >= history.length - 1}>
              ›
            </button>
            <button className="toolbar-btn" onClick={reload}>
              ⟳
            </button>
          </div>
          <form className="address-bar" onSubmit={handleSubmit}>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              spellCheck={false}
              placeholder="Type a URL"
            />
            <button type="submit" className="go-btn">Go</button>
          </form>
        </div>
        <div className="bookmark-bar">
          {bookmarks.map((bm) => (
            <button key={bm.url} className="bookmark" onClick={() => navigateTo(bm.url)}>
              {bm.label}
            </button>
          ))}
          <div className={`loading-dot ${isLoading ? 'active' : ''}`}>
            <div className="dot" />
          </div>
        </div>
        <div className="browser-frame">
          <iframe
            ref={iframeRef}
            src={currentUrl}
            title="Mini Browser"
            onLoad={() => setIsLoading(false)}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
          {isLoading && <div className="loading-overlay">Loading…</div>}
        </div>
        <div className="browser-status">{currentUrl}</div>
      </div>
    </Window>
  );
};

export default BrowserApp;
