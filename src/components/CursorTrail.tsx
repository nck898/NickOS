import { useEffect } from 'react';
import './CursorTrail.css';

const CursorTrail = () => {
  useEffect(() => {
    const stars: HTMLElement[] = [];
    let starIndex = 0;

    const createStar = (x: number, y: number) => {
      const star = document.createElement('div');
      star.className = 'cursor-star';
      const offsetX = (Math.random() - 0.5) * 20;
      const offsetY = (Math.random() - 0.5) * 20;
      star.style.left = `${x + offsetX}px`;
      star.style.top = `${y + offsetY}px`;
      star.style.setProperty('--star-offset-x', `${-offsetX}px`);
      star.style.setProperty('--star-offset-y', `${-offsetY}px`);
      document.body.appendChild(star);
      stars.push(star);

      setTimeout(() => {
        star.remove();
        const index = stars.indexOf(star);
        if (index > -1) {
          stars.splice(index, 1);
        }
      }, 500);
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Update CSS variable for star trail background
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);

      // Create star every few pixels - more frequent for better trail
      if (starIndex % 3 === 0) {
        createStar(e.clientX, e.clientY);
      }
      starIndex++;
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      stars.forEach(star => star.remove());
    };
  }, []);

  return null;
};

export default CursorTrail;

