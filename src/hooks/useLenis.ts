import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Scoped Lenis smooth scroll: active on Customer Portal for editorial flow,
 * disabled on Floor Desk and Owner ERP so dense tables & drawers keep crisp native scroll.
 */
export function useScopedLenis(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [enabled]);
}
