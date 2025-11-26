import { useState } from 'react';
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

  return (
    <div className="topbar">
      <div className="topbar-left">
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
