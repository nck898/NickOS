import { useState, useEffect, useRef } from 'react';
import Window from './Window';
import './PongApp.css';

interface PongAppProps {
  onClose?: () => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
  embedded?: boolean;
}

const PongApp = ({ onClose, onMinimize, isMinimized, embedded = false }: PongAppProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState({ player: 0, ai: 0 });
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused'>('menu');
  
  const paddleHeight = 80;
  const paddleWidth = 10;
  const ballSize = 10;
  const baseSpeed = 5;
  const rallyBoost = useRef(0);

  const [ball, setBall] = useState({ x: 300, y: 200, dx: baseSpeed, dy: baseSpeed });
  const [playerPaddle, setPlayerPaddle] = useState(150);
  const [aiPaddle, setAiPaddle] = useState(150);
  const [keys, setKeys] = useState({ up: false, down: false });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        setKeys(prev => ({ ...prev, up: true }));
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        setKeys(prev => ({ ...prev, down: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        setKeys(prev => ({ ...prev, up: false }));
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        setKeys(prev => ({ ...prev, down: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = setInterval(() => {
      // Move player paddle
      setPlayerPaddle(prev => {
        let newY = prev;
        if (keys.up && newY > 0) newY -= 7;
        if (keys.down && newY < canvas.height - paddleHeight) newY += 7;
        return newY;
      });

      // AI paddle (simple follow ball)
      setAiPaddle(prev => {
        const center = prev + paddleHeight / 2;
        const totalScore = score.player + score.ai;
        const mult = 1 + totalScore * 0.08; // medium scaling
        const aiSpeed = 3.2 * mult;
        const targetY = ball.x > canvas.width / 2 ? ball.y + ball.dy * 6 : ball.y; // lead a bit when coming in
        if (targetY < center - 4) return Math.max(0, prev - aiSpeed);
        if (targetY > center + 4) return Math.min(canvas.height - paddleHeight, prev + aiSpeed);
        return prev;
      });

      // Move ball
      setBall(prev => {
        const prevX = prev.x;
        let newX = prev.x + prev.dx;
        let newY = prev.y + prev.dy;
        let newDx = prev.dx;
        let newDy = prev.dy;
        const totalScore = score.player + score.ai;
        const speedMult = 1 + totalScore * 0.05 + rallyBoost.current;

        // top/bottom
        if (newY <= 0 || newY >= canvas.height - ballSize) {
          newDy = -newDy;
          newY = Math.max(0, Math.min(canvas.height - ballSize, newY));
        }

        // player paddle collision (crossing check)
        if (newX <= paddleWidth && prevX >= paddleWidth - ballSize) {
          if (newY + ballSize >= playerPaddle && newY <= playerPaddle + paddleHeight) {
            newDx = Math.abs(newDx);
            newX = paddleWidth;
          }
        }

        // AI paddle collision
        if (newX + ballSize >= canvas.width - paddleWidth && prevX + ballSize <= canvas.width - paddleWidth + ballSize) {
          if (newY + ballSize >= aiPaddle && newY <= aiPaddle + paddleHeight) {
            newDx = -Math.abs(newDx);
            newX = canvas.width - paddleWidth - ballSize;
          }
        }

        // Scoring
        if (newX < -ballSize) {
          setScore(prev => ({ ...prev, ai: prev.ai + 1 }));
          const mult = 1 + (score.player + score.ai + 1) * 0.1;
          rallyBoost.current = 0;
          return { x: canvas.width / 2, y: canvas.height / 2, dx: baseSpeed * mult, dy: baseSpeed * mult * (Math.random() > 0.5 ? 1 : -1) };
        }
        if (newX > canvas.width + ballSize) {
          setScore(prev => ({ ...prev, player: prev.player + 1 }));
          const mult = 1 + (score.player + score.ai + 1) * 0.1;
          rallyBoost.current = 0;
          return { x: canvas.width / 2, y: canvas.height / 2, dx: -baseSpeed * mult, dy: baseSpeed * mult * (Math.random() > 0.5 ? 1 : -1) };
        }

        const norm = Math.max(0.01, Math.hypot(newDx, newDy));
        const scaledDx = (newDx / norm) * baseSpeed * speedMult;
        const scaledDy = (newDy / norm) * baseSpeed * speedMult;

        return { x: newX, y: newY, dx: scaledDx, dy: scaledDy };
      });

      // rally boost over time to encourage quicker points
      rallyBoost.current = Math.min(1.5, rallyBoost.current + 0.0008 * (baseSpeed + Math.abs(ball.dx)));
    }, 16);

    return () => clearInterval(gameLoop);
  }, [gameState, keys, playerPaddle, aiPaddle, ball]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      // Clear canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw center line
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw paddles
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, playerPaddle, paddleWidth, paddleHeight);
      ctx.fillRect(canvas.width - paddleWidth, aiPaddle, paddleWidth, paddleHeight);

      // Draw ball
      ctx.fillRect(ball.x, ball.y, ballSize, ballSize);

      // Draw score
      ctx.fillStyle = '#fff';
      ctx.font = '32px "Comic Sans MS", Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${score.player}`, canvas.width / 4, 40);
      ctx.fillText(`${score.ai}`, (3 * canvas.width) / 4, 40);
    };

    let rafId: number;
    const loop = () => {
      draw();
      if (gameState === 'playing') {
        rafId = requestAnimationFrame(loop);
      }
    };

    rafId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafId);
  }, [ball, playerPaddle, aiPaddle, score, gameState]);

  const content = (
    <div className="pong-app">
      {gameState === 'menu' && (
        <div className="pong-menu">
          <h2>🎮 PONG</h2>
          <p>Use ↑↓ or W/S to move your paddle</p>
          <button className="retro-button" onClick={() => setGameState('playing')}>
            Start Game
          </button>
        </div>
      )}
      {gameState === 'playing' && (
        <>
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="pong-canvas"
          />
          <div className="pong-controls">
            <button className="retro-button" onClick={() => setGameState('paused')}>
              Pause
            </button>
            <button className="retro-button" onClick={() => {
              setGameState('menu');
              setScore({ player: 0, ai: 0 });
              setBall({ x: 300, y: 200, dx: baseSpeed, dy: baseSpeed });
            }}>
              Reset
            </button>
          </div>
        </>
      )}
      {gameState === 'paused' && (
        <div className="pong-paused">
          <h2>PAUSED</h2>
          <button className="retro-button" onClick={() => setGameState('playing')}>
            Resume
          </button>
        </div>
      )}
    </div>
  );

  if (embedded) return content;

  return (
    <Window title="Pong" icon="🎮" onClose={onClose!} onMinimize={onMinimize} isMinimized={isMinimized} initialWidth={700} initialHeight={500}>
      {content}
    </Window>
  );
};

export default PongApp;
