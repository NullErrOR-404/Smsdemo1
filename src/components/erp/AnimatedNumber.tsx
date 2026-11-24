import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  locale?: string;
  className?: string;
}

export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  locale = 'en-IN',
  className = '',
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);
  const objRef = useRef({ val: value });

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      objRef.current.val = value;
      setDisplay(value);
      return;
    }

    const tween = gsap.to(objRef.current, {
      val: value,
      duration: 0.55,
      ease: 'power2.out',
      onUpdate: () => setDisplay(Math.round(objRef.current.val)),
    });

    return () => {
      tween.kill();
    };
  }, [value]);

  return (
    <span className={`tabular ${className}`}>
      {prefix}
      {display.toLocaleString(locale)}
      {suffix}
    </span>
  );
}
