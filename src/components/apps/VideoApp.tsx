import { useState, useRef, useEffect } from 'react';
import Window from './Window';
import './VideoApp.css';

interface VideoAppProps {
  onClose: () => void;
}

// YouTube IFrame API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

// Extract video IDs from YouTube URLs
const allVideos = [
  { id: 'B-QoYVeXAHY' },
  { id: 'AKy3E_IophU' },
  { id: 'Y7AHPTAtiZg' },
  { id: 'tMWvoJjflfc' },
  { id: 'YowX1KuTjTU' },
  { id: 'u328DB1pQAE' },
  { id: '5tcBJCouOmE' },
  { id: '0BPTNdmdJSc' },
  { id: 'rKUJG5TdAl8' },
  { id: 'ogk5XJLVheo' },
  { id: '1Rr2RiglVlc' },
  { id: 'Z1PCtIaM_GQ' },
  { id: 'zkTf0LmDqKI' },
  { id: 'loPphiJWhyY' },
  { id: 'o-s9oOJDB8U' },
  { id: 'RH1Ncu7UA9Q' },
  { id: 'KCzwyFHSMdY' },
  { id: 'J8Pv3V1m7_A' },
  { id: '0v8Oenh0vWA' },
  { id: 'MdNFkKjvSLo' },
  { id: '2dPVewSG3O0' },
  { id: 'rbgo95qYvoU' },
  { id: 'CorNM4QG624' },
  { id: 'V60AzdCNLLY' },
  { id: 'crfrKqFp0Zg' },
  { id: 'GbItoJlfSyI' },
  { id: '9Ffi3KDgV2w' },
  { id: 'V3sQjiaM8YQ' },
];

// Shuffle function
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const VideoApp = ({ onClose }: VideoAppProps) => {
  const [videos] = useState(() => shuffleArray(allVideos));
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [volume, setVolume] = useState(100);
  const playerDivRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [apiReady, setApiReady] = useState(false);

  const currentVideo = videos[currentVideoIndex];

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setApiReady(true);
      };
    } else {
      setApiReady(true);
    }
  }, []);

  // Initialize player when API is ready (only once)
  useEffect(() => {
    if (apiReady && playerDivRef.current && !playerRef.current) {
      playerRef.current = new window.YT.Player(playerDivRef.current, {
        videoId: currentVideo.id,
        playerVars: {
          autoplay: !isPaused ? 1 : 0,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            event.target.setVolume(volume);
          },
        },
      });
    }
  }, [apiReady]);

  // Update volume when it changes
  useEffect(() => {
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  // Change video when currentVideoIndex changes
  useEffect(() => {
    if (apiReady && playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(currentVideo.id);
      if (!isPaused) {
        setTimeout(() => {
          if (playerRef.current && playerRef.current.playVideo) {
            playerRef.current.playVideo();
          }
        }, 500);
      }
    }
  }, [currentVideo.id, apiReady]);

  const handleNext = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
    setIsPaused(false);
  };

  const handlePrevious = () => {
    setCurrentVideoIndex((prev) => (prev - 1 + videos.length) % videos.length);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (playerRef.current) {
      if (isPaused) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
    setIsPaused(!isPaused);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  return (
    <Window title="Nicktime Player" icon="🎬" onClose={onClose} initialWidth={800} initialHeight={600}>
      <div className="video-app">
        <div className="video-player">
          <div className="video-container">
            <div className="crt-screen">
              <div
                ref={playerDivRef}
                className="video-frame"
                style={{ width: '100%', height: '100%' }}
              />
              <div className="crt-scanlines"></div>
              <div className="crt-glow"></div>
            </div>
          </div>
          <div className="video-controls">
            <button className="control-btn prev-btn" onClick={handlePrevious}>
              ◀◀
            </button>
            <button className="control-btn pause-btn" onClick={handlePause}>
              {isPaused ? '▶' : '⏸'}
            </button>
            <button className="control-btn next-btn" onClick={handleNext}>
              ▶▶
            </button>
            <div className="volume-control">
              <span className="volume-label">🔊</span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-slider"
              />
            </div>
          </div>
        </div>
      </div>
    </Window>
  );
};

export default VideoApp;
