import { useEffect, useRef, useState } from 'react';
import Window from './Window';
import './PhotoStudioApp.css';

interface PhotoStudioAppProps {
  onClose: () => void;
}

type Effect = {
  id: string;
  label: string;
  filter: string;
  overlay?: string;
};

type WarpMode = {
  id: string;
  label: string;
  cssTransform: string;
};

const effects: Effect[] = [
  { id: 'normal', label: 'Classic', filter: 'none' },
  { id: 'mono', label: 'Mono', filter: 'grayscale(1) contrast(1.1)' },
  { id: 'sepia', label: 'Sepia', filter: 'sepia(0.9) contrast(1.1)' },
  { id: 'vivid', label: 'Vivid', filter: 'saturate(1.7) contrast(1.1)' },
  { id: 'noir', label: 'Noir', filter: 'grayscale(1) contrast(1.6) brightness(0.8)' },
  { id: 'cyber', label: 'Cyan Glow', filter: 'hue-rotate(190deg) saturate(2) contrast(1.2)' },
  { id: 'warm', label: 'Warm Pop', filter: 'brightness(1.05) saturate(1.4) hue-rotate(-10deg)' },
  { id: 'cool', label: 'Cool Breeze', filter: 'brightness(1.05) saturate(1.2) hue-rotate(25deg)' },
  { id: 'pixel', label: 'Blocky', filter: 'contrast(1.4) saturate(1.4)', overlay: 'pixel' },
  { id: 'crt', label: 'CRT', filter: 'contrast(1.2) brightness(1.05)', overlay: 'scanlines' },
  { id: 'xray', label: 'X-Ray', filter: 'invert(1) hue-rotate(180deg) contrast(1.2)' },
  { id: 'poster', label: 'Posterize', filter: 'contrast(1.4) saturate(1.3) blur(1px)' },
];

const warpModes: WarpMode[] = [
  { id: 'normal', label: 'Normal', cssTransform: 'none' },
  { id: 'mirror', label: 'Mirror', cssTransform: 'scaleX(-1)' },
  { id: 'squish', label: 'Squeeze', cssTransform: 'scaleX(0.8) scaleY(1.05)' },
  { id: 'tall', label: 'Tall', cssTransform: 'scaleY(1.2) scaleX(0.95)' },
  { id: 'wide', label: 'Wide', cssTransform: 'scaleX(1.2) scaleY(0.95)' },
  { id: 'tiltL', label: 'Tilt Left', cssTransform: 'skewX(-8deg)' },
  { id: 'tiltR', label: 'Tilt Right', cssTransform: 'skewX(8deg)' },
];

const PhotoStudioApp = ({ onClose }: PhotoStudioAppProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const warpPreviewRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [activeEffect, setActiveEffect] = useState<Effect>(effects[0]);
  const [warpMode, setWarpMode] = useState<WarpMode>(warpModes[0]);
  const [snapshots, setSnapshots] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setError(null);
        setStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Mark ready as soon as we have a stream; play may be blocked but we still allow capture
          setIsReady(true);
          videoRef.current
            .play()
            .catch(() => {
              // Autoplay might be blocked; still consider ready with user gesture.
            });
        }
      } catch (err) {
        setError('Camera unavailable. Please allow access.');
      }
    };
    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((t) => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    // Mirror stream into preview tiles
    if (!stream) return;
    warpPreviewRefs.current.forEach((vid) => {
      if (vid && vid.srcObject !== stream) {
        vid.srcObject = stream;
        vid.play().catch(() => undefined);
      }
    });
  }, [stream]);

  const takeSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    // apply warp transforms
    const w = canvas.width;
    const h = canvas.height;
    switch (warpMode.id) {
      case 'mirror':
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        break;
      case 'squish':
        ctx.translate(w * 0.1, 0);
        ctx.scale(0.8, 1.05);
        break;
      case 'tall':
        ctx.translate(0, -h * 0.05);
        ctx.scale(0.95, 1.2);
        break;
      case 'wide':
        ctx.translate(-w * 0.05, 0);
        ctx.scale(1.2, 0.95);
        break;
      case 'tiltL':
        ctx.transform(1, 0.2, 0, 1, 0, 0);
        break;
      case 'tiltR':
        ctx.transform(1, -0.2, 0, 1, 0, 0);
        break;
      default:
        break;
    }

    ctx.filter = activeEffect.filter;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Overlay effects
    if (activeEffect.overlay === 'scanlines') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillRect(0, y, canvas.width, 2);
      }
    }
    if (activeEffect.overlay === 'pixel') {
      const pixelSize = 6;
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      for (let y = 0; y < canvas.height; y += pixelSize) {
        for (let x = 0; x < canvas.width; x += pixelSize) {
          const i = (y * canvas.width + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.fillRect(x, y, pixelSize, pixelSize);
        }
      }
    }

    const dataUrl = canvas.toDataURL('image/png');
    setSnapshots((prev) => [dataUrl, ...prev].slice(0, 8));
  };

  return (
    <Window
      title="Photo Studio"
      icon="📷"
      onClose={onClose}
      initialWidth={1100}
      initialHeight={800}
    >
      <div className="photo-studio">
        <div className="camera-pane">
          <div className="camera-frame">
            {!isReady && !error && <div className="status">Initializing camera…</div>}
            {error && <div className="status error">{error}</div>}
            <video
              ref={videoRef}
              className={`live-video overlay-${activeEffect.overlay || 'none'}`}
              style={{ filter: `${activeEffect.filter}`, transform: warpMode.cssTransform }}
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden-canvas" />
          </div>
          <div className="controls">
            <div className="effect-list">
              {effects.map((effect) => (
                <button
                  key={effect.id}
                  className={`effect-chip ${activeEffect.id === effect.id ? 'active' : ''}`}
                  onClick={() => setActiveEffect(effect)}
                >
                  {effect.label}
                </button>
              ))}
            </div>
            <button className="shutter" onClick={takeSnapshot} disabled={!isReady || !!error}>
              Take Photo
            </button>
          </div>
          <div className="warp-previews">
            {warpModes.map((mode, idx) => (
              <button
                key={mode.id}
                className={`warp-tile ${warpMode.id === mode.id ? 'active' : ''}`}
                onClick={() => setWarpMode(mode)}
              >
                <div className="warp-label">{mode.label}</div>
                <video
                  ref={(el) => {
                    warpPreviewRefs.current[idx] = el;
                  }}
                  className="warp-video"
                  muted
                  playsInline
                  style={{ transform: mode.cssTransform }}
                />
              </button>
            ))}
          </div>
        </div>
        <div className="film-strip">
          <div className="film-label">Recent Shots</div>
          <div className="shots-grid">
            {snapshots.length === 0 && <div className="empty">No snaps yet</div>}
            {snapshots.map((shot, idx) => (
              <div className="shot" key={idx}>
                <img src={shot} alt={`Snapshot ${idx + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Window>
  );
};

export default PhotoStudioApp;
