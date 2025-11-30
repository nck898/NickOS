import { useEffect, useRef, useState } from 'react';
import './PetWidget.css';

type PetAction =
  | 'idle'
  | 'idle_to_sleep'
  | 'sleep'
  | 'sleep_to_idle'
  | 'walk_left'
  | 'walk_right';

type EventBucket = 'idle' | 'idle_to_sleep' | 'sleep' | 'sleep_to_idle' | 'walk_left' | 'walk_right';

const eventPool: { bucket: EventBucket; weight: number }[] = [
  { bucket: 'idle', weight: 4 },
  { bucket: 'idle_to_sleep', weight: 1 },
  { bucket: 'sleep', weight: 5 },
  { bucket: 'sleep_to_idle', weight: 1 },
  { bucket: 'walk_left', weight: 2 },
  { bucket: 'walk_right', weight: 2 },
];

const assets: Record<PetAction, string> = {
  idle: '/cat/idle.gif',
  idle_to_sleep: '/cat/idle_to_sleep.gif',
  sleep: '/cat/sleeping.gif',
  sleep_to_idle: '/cat/sleep_to_idle.gif',
  walk_left: '/cat/walking_towards_left.gif',
  walk_right: '/cat/walking_towards_right.gif',
};

const darkAssets: Record<PetAction, string> = {
  idle: '/cat/idle-dark.gif',
  idle_to_sleep: '/cat/idle_to_sleep-dark.gif',
  sleep: '/cat/sleeping-dark.gif',
  sleep_to_idle: '/cat/sleep_to_idle-dark.gif',
  walk_left: '/cat/walking_towards_left-dark.gif',
  walk_right: '/cat/walking_towards_right-dark.gif',
};

const actionDuration: Record<PetAction, number> = {
  idle: 800,
  idle_to_sleep: 1000,
  sleep: 2000,
  sleep_to_idle: 900,
  walk_left: 1200,
  walk_right: 1200,
};

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
const PET_WIDTH = 120;
const WALK_SPEED = 40; // px per second
const PetWidget = () => {
  const [action, setAction] = useState<PetAction>('idle');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const attr = document.documentElement.getAttribute('data-theme');
    return attr === 'dark' ? 'dark' : 'light';
  });
  const [x, setX] = useState(24);
  const timeoutRef = useRef<number | null>(null);
  const velocityRef = useRef(0);
  const animRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const dockLeftRef = useRef<number | null>(null);

  const pickEvent = (): EventBucket => {
    const total = eventPool.reduce((sum, e) => sum + e.weight, 0);
    let roll = Math.random() * total;
    for (const entry of eventPool) {
      if (roll < entry.weight) return entry.bucket;
      roll -= entry.weight;
    }
    return 'idle';
  };

  const schedule = (nextAction: PetAction) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setAction(nextAction);

    if (nextAction === 'walk_left') {
      velocityRef.current = -WALK_SPEED;
    } else if (nextAction === 'walk_right') {
      velocityRef.current = WALK_SPEED;
    } else {
      velocityRef.current = 0;
    }

    const delay = actionDuration[nextAction] || 1000;
    timeoutRef.current = window.setTimeout(() => {
      const bucket = pickEvent();
      // simple state graph similar to the python mapping
      if (nextAction === 'idle_to_sleep') {
        schedule('sleep');
        return;
      }
      if (nextAction === 'sleep_to_idle') {
        schedule('idle');
        return;
      }
      if (bucket === 'idle_to_sleep' && nextAction === 'sleep') {
        schedule('sleep_to_idle');
        return;
      }
      schedule(bucket as PetAction);
    }, delay);
  };

  useEffect(() => {
    schedule('idle');
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const updateDockLeft = () => {
      const dock = document.querySelector('.dock') as HTMLElement | null;
      dockLeftRef.current = dock ? dock.getBoundingClientRect().left : null;
    };
    updateDockLeft();
    window.addEventListener('resize', updateDockLeft);
    return () => window.removeEventListener('resize', updateDockLeft);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const attr = document.documentElement.getAttribute('data-theme');
      setTheme(attr === 'dark' ? 'dark' : 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const step = (ts: number) => {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      if (velocityRef.current !== 0) {
        const fallback = Math.max(0, window.innerWidth - PET_WIDTH - 12);
        const dockLeft = dockLeftRef.current;
        const maxX = dockLeft !== null ? Math.max(0, dockLeft - PET_WIDTH) : fallback;
        setX((prev) => clamp(prev + velocityRef.current * dt, 0, maxX));
      }
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div className="pet-widget" style={{ left: `${x}px` }}>
      <img className="pet-sprite" src={(theme === 'dark' ? darkAssets : assets)[action]} alt="Desktop pet" draggable={false} />
    </div>
  );
};

export default PetWidget;
