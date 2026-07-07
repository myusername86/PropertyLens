import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  /** Renders the in-flight value, e.g. currency formatting. */
  format?: (current: number) => string;
  durationMs?: number;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Counts up from 0 to value on mount. Respects reduced-motion preference. */
export function AnimatedNumber({ value, format, durationMs = 700 }: AnimatedNumberProps) {
  const [current, setCurrent] = useState(prefersReducedMotion() ? value : 0);
  const frame = useRef<number>(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setCurrent(value);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(value * eased);
      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      }
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [value, durationMs]);

  return <>{format ? format(current) : Math.round(current).toLocaleString()}</>;
}
