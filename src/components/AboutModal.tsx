import { useEffect } from 'react';
import './AboutModal.css';

interface AboutModalProps {
  onClose: () => void;
}

const AboutModal = ({ onClose }: AboutModalProps) => {
  useEffect(() => {
    if (!document.querySelector('script[src="https://tenor.com/embed.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://tenor.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="about-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-icon">👋</span>
          <h2>About NickOS</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          <div className="about-info">
            <p className="about-creator">Created by <strong>Young Chan</strong></p>
            <div className="about-specs">
              <div className="spec-item">
                <span className="spec-label">💾 RAM:</span>
                <span className="spec-value">16 GB</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">💿 Storage:</span>
                <span className="spec-value">1 Terabyte</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Github:</span>
                <span className="spec-value">
                  <a href="https://github.com/nck898/NickOS" target="_blank" rel="noreferrer">
                    nck898/NickOS
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
