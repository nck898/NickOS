import { useEffect, useRef, useState } from 'react';
import Window from './Window';
import './PhotoStudioApp.css';

interface PhotoStudioAppProps {
  onClose: () => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
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
  cssTransform?: string;
  overlay?: 'tunnel';
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
  { id: 'bulge', label: 'Bulge', cssTransform: 'scale(1.06)' },
  { id: 'dent', label: 'Dent', cssTransform: 'scale(0.95)' },
  { id: 'twirl', label: 'Twirl', cssTransform: 'rotate(4deg) scale(1.05)' },
  { id: 'fisheye', label: 'Fish Eye', cssTransform: 'scale(1.08)' },
  { id: 'tunnel', label: 'Light Tunnel', cssTransform: 'scale(0.94)', overlay: 'tunnel' },
  { id: 'stretch', label: 'Stretch', cssTransform: 'scaleY(1.2) scaleX(0.9)' },
];

const PhotoStudioApp = ({ onClose, onMinimize, isMinimized }: PhotoStudioAppProps) => {
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

  const drawWarpedFrame = (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = video.videoWidth || canvas.width;
    const h = video.videoHeight || canvas.height;
    canvas.width = w;
    canvas.height = h;

    if (warpMode.id === 'mirror') {
      ctx.save();
      ctx.filter = activeEffect.filter;
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, w, h);
      ctx.restore();
      return;
    }

    const temp = document.createElement('canvas');
    temp.width = w;
    temp.height = h;
    const tctx = temp.getContext('2d');
    if (!tctx) return;
    tctx.filter = activeEffect.filter;
    tctx.drawImage(video, 0, 0, w, h);

    const src = tctx.getImageData(0, 0, w, h);
    const dst = ctx.createImageData(w, h);
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(cx, cy);

    const mapCoord = (x: number, y: number) => {
      let nx = (x - cx) / radius;
      let ny = (y - cy) / radius;
      let r = Math.hypot(nx, ny);
      if (r > 1) return { sx: x, sy: y, out: true };
      let theta = Math.atan2(ny, nx);

      switch (warpMode.id) {
        case 'bulge':
          r = Math.pow(r, 0.65);
          break;
        case 'dent':
          r = Math.pow(r, 1.35);
          break;
        case 'fisheye':
          r = Math.pow(r, 0.55);
          break;
        case 'tunnel':
          r = Math.pow(r, 1.8);
          break;
        case 'twirl':
          theta += (1 - r) * 1.4;
          break;
        case 'stretch':
          nx *= 0.8;
          ny *= 1.25;
          r = Math.hypot(nx, ny);
          theta = Math.atan2(ny, nx);
          break;
        default:
          break;
      }

      const sx = cx + r * radius * Math.cos(theta);
      const sy = cy + r * radius * Math.sin(theta);
      return { sx, sy, out: false };
    };

    const sData = src.data;
    const dData = dst.data;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const { sx, sy } = mapCoord(x, y);
        const ix = Math.max(0, Math.min(w - 1, Math.round(sx)));
        const iy = Math.max(0, Math.min(h - 1, Math.round(sy)));
        const srcIdx = (iy * w + ix) * 4;
        const dstIdx = (y * w + x) * 4;
        dData[dstIdx] = sData[srcIdx];
        dData[dstIdx + 1] = sData[srcIdx + 1];
        dData[dstIdx + 2] = sData[srcIdx + 2];
        dData[dstIdx + 3] = sData[srcIdx + 3];
      }
    }

    ctx.putImageData(dst, 0, 0);
  };

  const takeSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    drawWarpedFrame(video, canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Overlay effects
    if (warpMode.overlay === 'tunnel') {
      ctx.save();
      const grd = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) / 1.2
      );
      grd.addColorStop(0, 'rgba(255,255,255,0)');
      grd.addColorStop(0.4, 'rgba(20,30,60,0.2)');
      grd.addColorStop(1, 'rgba(0,0,0,0.8)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

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
      onMinimize={onMinimize}
      isMinimized={isMinimized}
      initialWidth={1100}
      initialHeight={800}
    >
      <div className="photo-studio">
        <div className="camera-pane">
          <div className="capture-bar">
            <button className="shutter" onClick={takeSnapshot} disabled={!isReady || !!error}>
              Take Photo
            </button>
          </div>
          <div className="camera-frame">
            {!isReady && !error && <div className="status">Initializing camera…</div>}
            {error && <div className="status error">{error}</div>}
            <video
              ref={videoRef}
              className={`live-video overlay-${activeEffect.overlay || 'none'} overlay-${warpMode.overlay || 'none'}`}
              style={{ filter: `${activeEffect.filter}`, transform: warpMode.cssTransform }}
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden-canvas" />
          </div>
          <div className="controls">
            <div className="control-section">
              <div className="control-label">Looks</div>
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
            </div>
            <div className="control-section">
              <div className="control-label">Warp</div>
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
                      className={`warp-video overlay-${mode.overlay || 'none'}`}
                      muted
                      playsInline
                      style={{ transform: mode.cssTransform }}
                    />
                  </button>
                ))}
              </div>
            </div>
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
