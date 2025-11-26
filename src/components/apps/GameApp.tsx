import { useEffect, useRef, useState } from 'react';
import Window from './Window';
import './GameApp.css';

interface GameAppProps {
  onClose: () => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
}

type GameKey = 'snake';

const GameApp = ({ onClose, onMinimize, isMinimized }: GameAppProps) => {
  const [activeGame, setActiveGame] = useState<GameKey>('snake');
  return (
    <Window
      title="Games"
      icon="🎮"
      onClose={onClose}
      onMinimize={onMinimize}
      isMinimized={isMinimized}
      initialWidth={820}
      initialHeight={620}
    >
      <div className="game-app">
        <div className="game-tabs">
          <button
            className={`game-tab ${activeGame === 'snake' ? 'active' : ''}`}
            onClick={() => setActiveGame('snake')}
          >
            Retro Snake
          </button>
        </div>
        <div className="game-frame">
          {activeGame === 'snake' && <SnakeGame />}
        </div>
        <div className="game-help">
          {activeGame === 'snake' && (
            <p><strong>Snake:</strong> Arrows/WASD to move. Eat apples to grow. Don’t hit walls or yourself. Press R to restart.</p>
          )}
        </div>
      </div>
    </Window>
  );
};

const SnakeGame = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dirRef = useRef<'up' | 'down' | 'left' | 'right'>('right');
  const snake = useRef<{ x: number; y: number }[]>([
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 },
    { x: 2, y: 5 },
    { x: 1, y: 5 },
  ]);
  const food = useRef<{ x: number; y: number }>({ x: 12, y: 10 });
  const alive = useRef(true);
  const speed = useRef(240);
  const loopRef = useRef<number | null>(null);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const current = dirRef.current;
      if ((key === 'arrowup' || key === 'w') && current !== 'down') dirRef.current = 'up';
      if ((key === 'arrowdown' || key === 's') && current !== 'up') dirRef.current = 'down';
      if ((key === 'arrowleft' || key === 'a') && current !== 'right') dirRef.current = 'left';
      if ((key === 'arrowright' || key === 'd') && current !== 'left') dirRef.current = 'right';
      if (key === 'r') {
        snake.current = [
          { x: 5, y: 5 },
          { x: 4, y: 5 },
          { x: 3, y: 5 },
          { x: 2, y: 5 },
          { x: 1, y: 5 },
        ];
        food.current = { x: 12, y: 10 };
        alive.current = true;
        speed.current = 240;
        dirRef.current = 'right';
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const grid = 20;
    let acc = 0;

    const step = (dt: number) => {
      acc += dt;
      if (acc >= speed.current) {
        acc = 0;
        if (alive.current) {
          const current = dirRef.current;
          const head = { ...snake.current[0] };
          if (current === 'up') head.y -= 1;
          if (current === 'down') head.y += 1;
          if (current === 'left') head.x -= 1;
          if (current === 'right') head.x += 1;

          // wall collision
          if (head.x < 0 || head.y < 0 || head.x >= grid || head.y >= grid) {
            alive.current = false;
          }
          // self collision (check against body, excluding last tail segment about to drop)
          const bodyToCheck = snake.current.slice(0, -1);
          if (bodyToCheck.some((s) => s.x === head.x && s.y === head.y)) {
            alive.current = false;
          }

          snake.current = [head, ...snake.current];

          // food
          if (head.x === food.current.x && head.y === food.current.y) {
            speed.current = Math.max(120, speed.current - 8);
            food.current = { x: Math.floor(Math.random() * grid), y: Math.floor(Math.random() * grid) };
          } else {
            snake.current.pop();
          }
        }
      }

      // draw
      ctx.fillStyle = '#0b0b0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, canvas.width, 20);

      ctx.fillStyle = '#fff';
      snake.current.forEach((s) => {
        ctx.fillRect(s.x * 16 + 1, s.y * 16 + 1, 14, 14);
      });
      ctx.fillStyle = '#ccc';
      ctx.fillRect(food.current.x * 16 + 1, food.current.y * 16 + 1, 14, 14);

      ctx.fillStyle = '#fff';
      ctx.fillText(`Length: ${snake.current.length}`, 10, 14);

      if (!alive.current) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.fillText('Game Over - Press R', 40, canvas.height / 2);
      }
    };

    let last = performance.now();
    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      step(dt);
      loopRef.current = requestAnimationFrame(loop);
    };
    loopRef.current = requestAnimationFrame(loop);

    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="snake-canvas" width={320} height={320} />;
};

export default GameApp;
