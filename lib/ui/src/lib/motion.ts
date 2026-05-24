import { useEffect, useRef, useState } from 'react';
import type { Variants } from 'framer-motion';

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: 'easeOut' } },
};

export const staggerChildren: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export const slideIn: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.24, ease: 'easeOut' } },
};

export const drawOn: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 0.6, ease: 'easeInOut' }, opacity: { duration: 0.1 } },
  },
};

export function useCountUp(target: number, duration = 600) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>(null);

  useEffect(() => {
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(progress * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return value;
}
