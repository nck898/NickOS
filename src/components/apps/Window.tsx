import React, { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import './Window.css';
import { soundManager } from '../../utils/sounds';

interface WindowProps {
  title?: string;
  icon: string;
  children: ReactNode;
  onClose: () => void;
  onMinimize?: (state: { x: number; y: number; width: number; height: number }) => void;
  isMinimized?: boolean;
  initialWidth?: number;
  initialHeight?: number;
  initialX?: number;
  initialY?: number;
  showMinimize?: boolean;
  onPositionChange?: (pos: { x: number; y: number }) => void;
  className?: string;
}

const MIN_WIDTH = 300;
const MIN_HEIGHT = 200;
const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

const Window = ({ 
  title, 
  icon, 
  children, 
  onClose,
  onMinimize,
  isMinimized = false,
  initialWidth = 600,
  initialHeight = 400,
  initialX,
  initialY,
  showMinimize = true,
  onPositionChange,
  className = '',
}: WindowProps) => {
  const [, setIsDragging] = useState(false);
  const [, setIsResizing] = useState(false);
  const [, setResizeDirection] = useState<string>('');
  const [position, setPosition] = useState({
    x: initialX ?? Math.random() * 200 + 100,
    y: initialY ?? Math.random() * 100 + 100,
  });
  const [size, setSize] = useState({
    width: initialWidth,
    height: initialHeight,
  });
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: initialWidth, height: initialHeight });
  const resizeDirectionRef = useRef<string>('');
  const positionRef = useRef(position);
  const sizeRef = useRef(size);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    sizeRef.current = size;
  }, [size]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.window-title-bar') && !target.closest('.window-controls')) {
      setIsDragging(true);
      isDraggingRef.current = true;
      soundManager.playClick();
      const offset = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
      dragOffsetRef.current = offset;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.window-title-bar') && !target.closest('.window-controls')) {
      setIsDragging(true);
      isDraggingRef.current = true;
      soundManager.playClick();
      const touch = e.touches[0];
      const offset = {
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      };
      dragOffsetRef.current = offset;
      e.preventDefault();
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    setIsResizing(true);
    isResizingRef.current = true;
    setResizeDirection(direction);
    resizeDirectionRef.current = direction;
    const startState = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    };
    resizeStartRef.current = startState;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const maxX = window.innerWidth - MIN_WIDTH / 2;
        const maxY = window.innerHeight - MIN_HEIGHT / 2;
        const nextX = clamp(e.clientX - dragOffsetRef.current.x, 0, maxX);
        const nextY = clamp(e.clientY - dragOffsetRef.current.y, 0, maxY);
        positionRef.current = { x: nextX, y: nextY };
        setPosition(positionRef.current);
      } else if (isResizingRef.current) {
        const deltaX = e.clientX - resizeStartRef.current.x;
        const deltaY = e.clientY - resizeStartRef.current.y;
        
        let newWidth = resizeStartRef.current.width;
        let newHeight = resizeStartRef.current.height;
        let newX = positionRef.current.x;
        let newY = positionRef.current.y;

        if (resizeDirectionRef.current.includes('e')) {
          newWidth = Math.max(MIN_WIDTH, resizeStartRef.current.width + deltaX);
        }
        if (resizeDirectionRef.current.includes('w')) {
          newWidth = Math.max(MIN_WIDTH, resizeStartRef.current.width - deltaX);
          newX = positionRef.current.x + (resizeStartRef.current.width - newWidth);
        }
        if (resizeDirectionRef.current.includes('s')) {
          newHeight = Math.max(MIN_HEIGHT, resizeStartRef.current.height + deltaY);
        }
        if (resizeDirectionRef.current.includes('n')) {
          newHeight = Math.max(MIN_HEIGHT, resizeStartRef.current.height - deltaY);
          newY = positionRef.current.y + (resizeStartRef.current.height - newHeight);
        }

        const boundedX = clamp(newX, 0, Math.max(0, window.innerWidth - newWidth));
        const boundedY = clamp(newY, 0, Math.max(0, window.innerHeight - newHeight));

        sizeRef.current = { width: newWidth, height: newHeight };
        positionRef.current = { x: boundedX, y: boundedY };

        setSize(sizeRef.current);
        if (resizeDirectionRef.current.includes('w') || resizeDirectionRef.current.includes('n')) {
          setPosition(positionRef.current);
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current && !isResizingRef.current) return;
      const touch = e.touches[0];
      if (!touch) return;
      if (isDraggingRef.current) {
        const maxX = window.innerWidth - MIN_WIDTH / 2;
        const maxY = window.innerHeight - MIN_HEIGHT / 2;
        const nextX = clamp(touch.clientX - dragOffsetRef.current.x, 0, maxX);
        const nextY = clamp(touch.clientY - dragOffsetRef.current.y, 0, maxY);
        positionRef.current = { x: nextX, y: nextY };
        setPosition(positionRef.current);
      }
      e.preventDefault();
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current || isResizingRef.current) {
        isDraggingRef.current = false;
        isResizingRef.current = false;
        setIsDragging(false);
        setIsResizing(false);
        setResizeDirection('');
        onPositionChange?.(positionRef.current);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const maxWidth = Math.max(MIN_WIDTH, window.innerWidth - 16);
      const maxHeight = Math.max(MIN_HEIGHT, window.innerHeight - 32);
      const nextWidth = Math.min(sizeRef.current.width, maxWidth);
      const nextHeight = Math.min(sizeRef.current.height, maxHeight);
      const nextX = clamp(positionRef.current.x, 0, Math.max(0, window.innerWidth - nextWidth));
      const nextY = clamp(positionRef.current.y, 0, Math.max(0, window.innerHeight - nextHeight));

      const sizeChanged = nextWidth !== sizeRef.current.width || nextHeight !== sizeRef.current.height;
      const positionChanged = nextX !== positionRef.current.x || nextY !== positionRef.current.y;

      if (sizeChanged) {
        sizeRef.current = { width: nextWidth, height: nextHeight };
        setSize(sizeRef.current);
      }
      if (positionChanged) {
        positionRef.current = { x: nextX, y: nextY };
        setPosition(positionRef.current);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const styleVars: React.CSSProperties = {
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `min(${size.width}px, calc(100vw - 16px))`,
    height: `min(${size.height}px, calc(100vh - 32px))`,
    ['--win-x' as any]: `${position.x}px`,
    ['--win-y' as any]: `${position.y}px`,
    ['--win-w' as any]: `${size.width}px`,
    ['--win-h' as any]: `${size.height}px`,
  };

  return (
    <div
      className={`window ${isMinimized ? 'minimized' : ''} ${className}`}
      style={styleVars}
    >
      <div
        className="window-title-bar"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="window-controls left">
          <button 
            className="window-control close" 
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
          {showMinimize && (
            <button
              className="window-control minimize"
              onClick={() => onMinimize?.({ x: positionRef.current.x, y: positionRef.current.y, width: sizeRef.current.width, height: sizeRef.current.height })}
              aria-label="Minimize"
            >
              –
            </button>
          )}
        </div>
        <div className="window-title-left">
          <span className="window-icon">{icon}</span>
          <span className="window-title">{title}</span>
        </div>
        <div className="window-controls right" />
      </div>
      <div className="window-content">{children}</div>
      <div className="resize-handle resize-n" onMouseDown={(e) => handleResizeMouseDown(e, 'n')}></div>
      <div className="resize-handle resize-s" onMouseDown={(e) => handleResizeMouseDown(e, 's')}></div>
      <div className="resize-handle resize-w" onMouseDown={(e) => handleResizeMouseDown(e, 'w')}></div>
      <div className="resize-handle resize-e" onMouseDown={(e) => handleResizeMouseDown(e, 'e')}></div>
      <div className="resize-handle resize-nw" onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}></div>
      <div className="resize-handle resize-ne" onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}></div>
      <div className="resize-handle resize-sw" onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}></div>
      <div className="resize-handle resize-se" onMouseDown={(e) => handleResizeMouseDown(e, 'se')}></div>
    </div>
  );
};

export default Window;
