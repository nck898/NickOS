import { useEffect, useRef, useState } from 'react';
import './TopBar.css';

interface MenuItem {
  label: string;
  action?: () => void;
  submenu?: MenuItem[];
}

interface TopBarProps {
  onShowAbout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const TopBar = ({ onShowAbout, theme, onToggleTheme }: TopBarProps) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const topLeftRef = useRef<HTMLDivElement | null>(null);
  const greetingsBase = [
    { lang: 'English', text: 'welcome to NickOS!' },
    { lang: 'French', text: 'bienvenue sur NickOS!' },
    { lang: 'Korean', text: 'NickOS에 오신 것을 환영합니다!' },
    { lang: 'Japanese', text: 'NickOSへようこそ!' },
    { lang: 'Spanish', text: '¡bienvenido a NickOS!' },
    { lang: 'German', text: 'willkommen bei NickOS!' },
  ];

  const [greetIndex, setGreetIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [greetingOrder, setGreetingOrder] = useState(greetingsBase);

  // Shuffle helper (Fisher–Yates)
  const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Build an order where English is first, Korean second, rest shuffled
  useEffect(() => {
    const english = greetingsBase.find((g) => g.lang === 'English');
    const korean = greetingsBase.find((g) => g.lang === 'Korean');
    const rest = greetingsBase.filter((g) => g.lang !== 'English' && g.lang !== 'Korean');
    setGreetingOrder([english!, korean!, ...shuffle(rest)]);
  }, []);

  useEffect(() => {
    const swap = setInterval(() => {
      setGreetIndex((prev) => (prev + 1) % greetingOrder.length);
    }, 10000);
    return () => clearInterval(swap);
  }, [greetingOrder.length]);

  useEffect(() => {
    setTypedText('');
    setCharIndex(0);
  }, [greetIndex, greetingOrder]);

  useEffect(() => {
    const full = greetingOrder[greetIndex]?.text || '';
    if (charIndex > full.length) return;
    const handle = setTimeout(() => {
      setTypedText(full.slice(0, charIndex));
      setCharIndex((prev) => prev + 1);
    }, 65);
    return () => clearTimeout(handle);
  }, [charIndex, greetIndex, greetingOrder]);

  const menuItems: { [key: string]: MenuItem[] } = {
    'NickOS': [
      { label: 'About NickOS', action: onShowAbout },
      { label: 'Preferences...', action: () => alert('Who cares about your preferences? :P') },
      { label: '---' },
    ],
    'File': [
      { label: 'New Folder'},
      { label: 'New File'},
      { label: '---' },
      { label: 'Get Info', action: () => alert('Info: This is NickOS what more info do you need?') },
    ],
    'Edit': [
      { label: 'Undo'},
      { label: 'Redo'},
      { label: '---' },
      { label: 'Cut'},
      { label: 'Copy'},
      { label: 'Paste'},
    ],
    'View': [
      { label: 'Show View Options', action: () => alert('Umm this is awkward, theres no view options...') },
      { label: 'Clean Up', action: () => alert('Desktop is cleaned! Jk, theres nothing to clean up') },
    ],
  };

  const handleMenuClick = (menuName: string) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleMenuItemClick = (item: MenuItem) => {
    if (item.action) {
      item.action();
      setActiveMenu(null);
    }
  };

  useEffect(() => {
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (!activeMenu) return;
      const target = e.target as HTMLElement;
      if (topLeftRef.current && !topLeftRef.current.contains(target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [activeMenu]);

  return (
    <div className="topbar">
      <div className="topbar-left" ref={topLeftRef}>
        <div className="apple-logo" onClick={onShowAbout}>🍎</div>
        {Object.keys(menuItems).map((menuName) => (
          <div key={menuName} className="menu-item">
            <button
              className={`menu-button ${activeMenu === menuName ? 'active' : ''}`}
              onClick={() => handleMenuClick(menuName)}
            >
              {menuName}
            </button>
            {activeMenu === menuName && (
              <div className="dropdown-menu">
                {menuItems[menuName].map((item, index) => (
                  item.label === '---' ? (
                    <div key={index} className="menu-divider" />
                  ) : (
                    <div
                      key={index}
                      className="dropdown-item"
                      onClick={() => handleMenuItemClick(item)}
                    >
                      {item.label}
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="topbar-right">
        <div className="topbar-greeting" aria-live="polite">
          <span className="greeting-text">{typedText}</span>
          <span className="greeting-cursor">|</span>
        </div>
        <button className="theme-toggle" onClick={onToggleTheme}>
          {theme === 'light' ? '☀️ Light' : '🌙 Dark'}
        </button>
        <div className="time-display">
          {new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          })}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
export type { TopBarProps };
