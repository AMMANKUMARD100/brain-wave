import { useEffect, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  duration?: number;
}

export default function AnimatedNumber({ value, decimals = 0, duration = 500 }: AnimatedNumberProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const start = 0;
    const steps = 30;
    const increment = (value - start) / steps;
    let step = 0;
    const interval = window.setInterval(() => {
      step += 1;
      const next = start + increment * step;
      setCurrent(step >= steps ? value : Number(next.toFixed(decimals)));
      if (step >= steps) {
        window.clearInterval(interval);
      }
    }, duration / steps);

    return () => window.clearInterval(interval);
  }, [value, duration, decimals]);

  return <span>{current.toFixed(decimals)}</span>;
}
