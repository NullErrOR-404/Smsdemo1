import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useSalonStore } from '../store/useSalonStore';
import { AnimatedNumber } from './erp/AnimatedNumber';

export function DepartureBoard() {
  const chairs = useSalonStore((s) => s.chairs);
  const stylists = useSalonStore((s) => s.stylists);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!boardRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cells = boardRef.current.querySelectorAll('[data-board-cell]');
    const ctx = gsap.context(() => {
      gsap.from(cells, {
        y: 16,
        opacity: 0,
        duration: 0.55,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
      });
    }, boardRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={boardRef}
      aria-label="Live chair standing"
      className="border-t border-b border-[var(--sd-line)] py-8 sm:py-10 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12"
    >
      {chairs.map((chair) => {
        const stylist = stylists.find((s) => s.id === chair.stylistId);
        const isOpen = !chair.customerName;
        return (
          <div key={chair.id} data-board-cell className="flex items-end justify-between gap-6">
            <div className="min-w-0 space-y-1">
              <p className="font-mono-code text-[12px] text-[var(--sd-muted)]">
                CHAIR {chair.chairNumber}
              </p>
              <p className="text-[16px] font-semibold text-[var(--sd-ink)] truncate">
                {stylist?.name ?? 'Stylist'}
              </p>
              <p className="text-[13px] text-[var(--sd-muted)] truncate">
                {isOpen ? 'Open for next guest' : `With ${chair.customerName}`}
              </p>
            </div>
            <div className="text-right shrink-0">
              {isOpen ? (
                <p className="font-serif-display text-4xl text-[var(--sd-brand)] leading-none">
                  Open
                </p>
              ) : (
                <>
                  <p className="font-serif-display text-5xl leading-none text-[var(--sd-ink)]">
                    <AnimatedNumber value={chair.remainingMins} suffix="m" />
                  </p>
                  <p className="text-[12px] text-[var(--sd-muted)] mt-1.5">remaining</p>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
