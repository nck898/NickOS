import { useEffect, useRef, useState } from 'react';
import Window from './Window';
import './MusicPlayerApp.css';

type MusicPlayerAppProps = {
  onClose: () => void;
  onMinimize: () => void;
  isMinimized: boolean;
  initialX?: number;
  initialY?: number;
};

const tracks = [
  {
    title: 'Luv(sic.) pt3',
    artist: 'Nujabes feat. Shing02',
    cover: '/music/covers/modal-soul.png',
    src: '/music/audio/Nujabes-Luv(sic.)pt3(feat. Shing02).mp3',
  },
  {
    title: 'Ego',
    artist: 'Crush',
    cover: '/music/covers/crush.png',
    src: '/music/audio/Crush-Ego.mp3',
  },
  {
    title: 'Easy',
    artist: 'Mac Ayres',
    cover: '/music/covers/easy.png',
    src: '/music/audio/Mac_Ayres-Easy.mp3',
  },
] as const;

const MusicPlayerApp = ({ onClose, onMinimize, isMinimized, initialX, initialY }: MusicPlayerAppProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [liked, setLiked] = useState(false);
  const [beatKey, setBeatKey] = useState(0);
  const currentTrack = tracks[trackIndex];

  useEffect(() => {
    const audio = new Audio(tracks[0].src);
    audio.preload = 'metadata';
    audioRef.current = audio;

    const onLoaded = () => setDuration(audio.duration || 0);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const wasPlaying = isPlaying;
    audio.src = currentTrack.src;
    setCurrentTime(0);
    setDuration(0);
    audio.load();
    if (wasPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
    setLiked(false);
  }, [trackIndex, currentTrack.src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(duration) || duration === 0) return;
    const nextTime = Math.min(Math.max(0, value), duration);
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleNext = () => {
    setTrackIndex((idx) => (idx + 1) % tracks.length);
  };

  const handlePrev = () => {
    setTrackIndex((idx) => (idx - 1 + tracks.length) % tracks.length);
  };

  const formatTime = (time: number) => {
    if (!Number.isFinite(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60)
      .toString()
      .padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleToggleLike = () => {
    setLiked((prev) => {
      const next = !prev;
      setBeatKey((k) => k + 1);
      return next;
    });
  };

  return (
    <Window
      title=""
      icon=""
      onClose={onClose}
      onMinimize={() => onMinimize()}
      isMinimized={isMinimized}
      initialWidth={300}
      initialHeight={480}
      initialX={initialX}
      initialY={initialY}
      className="music-window"
      showMinimize={true}
    >
      <div className="music-widget">
        <div className="music-glow">
          <div className="album-shadow">
            <div className="album-wrap">
              <img className="album-art" src={currentTrack.cover} alt={`${currentTrack.title} cover`} />
              <div className="record-hole" />
            </div>
          </div>
        </div>

        <div className="track-meta">
          <div>
            <div className="track-title">{currentTrack.title}</div>
            <div className="track-artist">{currentTrack.artist}</div>
          </div>
          <button
            key={beatKey}
            className={`heart-btn ${liked ? 'active' : ''}`}
            aria-label={liked ? 'unlike' : 'like'}
            onClick={handleToggleLike}
          >
            {liked ? '♥' : '♡'}
          </button>
        </div>

        <div className="progress-row">
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={Number.isFinite(currentTime) ? currentTime : 0}
            step="0.1"
            onChange={(e) => handleSeek(Number(e.target.value))}
          />
          <div className="time-labels">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="controls-row">
          <button className="ghost-btn" aria-label="shuffle">⇄</button>
          <button className="ghost-btn" aria-label="previous" onClick={handlePrev}>⏮</button>
          <button className="play-btn" onClick={togglePlay} aria-label="play-pause">
            {isPlaying ? '❚❚' : '►'}
          </button>
          <button className="ghost-btn" aria-label="next" onClick={handleNext}>⏭</button>
          <button className="ghost-btn" aria-label="repeat">🔁</button>
        </div>
      </div>
    </Window>
  );
};

export default MusicPlayerApp;
