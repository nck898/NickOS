import { useState, useEffect, useRef } from 'react';
import Window from './Window';
import './PongApp.css';

interface PongAppProps {
  onClose: () => void;
}

const PongApp = ({ onClose }: PongAppProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState({ player: 0, ai: 0 });
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused'>('menu');
  
  const paddleHeight = 80;
  const paddleWidth = 10;
  const ballSize = 10;
  const gameSpeed = 5;

  const [ball, setBall] = useState({ x: 300, y: 200, dx: gameSpeed, dy: gameSpeed });
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
        if (ball.y < center - 5) return Math.max(0, prev - 4);
        if (ball.y > center + 5) return Math.min(canvas.height - paddleHeight, prev + 4);
        return prev;
      });

      // Move ball
      setBall(prev => {
        let newX = prev.x + prev.dx;
        let newY = prev.y + prev.dy;
        let newDx = prev.dx;
        let newDy = prev.dy;

        // Ball collision with top/bottom walls
        if (newY <= 0 || newY >= canvas.height - ballSize) {
          newDy = -newDy;
        }

        // Ball collision with player paddle
        if (newX <= paddleWidth && 
            newY + ballSize >= playerPaddle && 
            newY <= playerPaddle + paddleHeight &&
            newDx < 0) {
          newDx = -newDx;
          newX = paddleWidth;
        }

        // Ball collision with AI paddle
        if (newX >= canvas.width - paddleWidth - ballSize && 
            newY + ballSize >= aiPaddle && 
            newY <= aiPaddle + paddleHeight &&
            newDx > 0) {
          newDx = -newDx;
          newX = canvas.width - paddleWidth - ballSize;
        }

        // Score points
        if (newX < 0) {
          setScore(prev => ({ ...prev, ai: prev.ai + 1 }));
          return { x: canvas.width / 2, y: canvas.height / 2, dx: gameSpeed, dy: gameSpeed };
        }
        if (newX > canvas.width) {
          setScore(prev => ({ ...prev, player: prev.player + 1 }));
          return { x: canvas.width / 2, y: canvas.height / 2, dx: -gameSpeed, dy: gameSpeed };
        }

        return { x: newX, y: newY, dx: newDx, dy: newDy };
      });
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

  return (
    <Window title="Pong" icon="🎮" onClose={onClose} initialWidth={700} initialHeight={500}>
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
                setBall({ x: 300, y: 200, dx: gameSpeed, dy: gameSpeed });
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
    </Window>
  );
};

export default PongApp;
