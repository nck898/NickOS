import { useState } from 'react';
import './TopBar.css';

interface MenuItem {
  label: string;
  action?: () => void;
  submenu?: MenuItem[];
}

interface TopBarProps {
  onShowAbout: () => void;
}

const TopBar = ({ onShowAbout }: TopBarProps) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const menuItems: { [key: string]: MenuItem[] } = {
    'NickOS': [
      { label: 'About NickOS', action: onShowAbout },
      { label: 'Preferences...', action: () => alert('Preferences coming soon!') },
      { label: '---' },
      { label: 'Quit', action: () => window.close() },
    ],
    'File': [
      { label: 'New Folder', action: () => alert('New folder created!') },
      { label: 'New File', action: () => alert('New file created!') },
      { label: '---' },
      { label: 'Get Info', action: () => alert('Info: This is NickOS!') },
    ],
    'Edit': [
      { label: 'Undo', action: () => alert('Undo!') },
      { label: 'Redo', action: () => alert('Redo!') },
      { label: '---' },
      { label: 'Cut', action: () => alert('Cut!') },
      { label: 'Copy', action: () => alert('Copy!') },
      { label: 'Paste', action: () => alert('Paste!') },
    ],
    'View': [
      { label: 'Show View Options', action: () => alert('View options!') },
      { label: 'Clean Up', action: () => alert('Desktop cleaned!') },
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
