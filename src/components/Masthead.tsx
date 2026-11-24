import { motion } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import { formatClock, useSalonStore } from '../store/useSalonStore';
import type { RoleView } from '../types/salon';

const NAV_ITEMS: { id: RoleView; label: string }[] = [
  { id: 'customer', label: 'Book and Queue' },
  { id: 'desk', label: 'Floor Desk' },
  { id: 'erp', label: 'Owner ERP' },
];

export function Masthead() {
  const activeRole = useSalonStore((s) => s.activeRole);
  const setActiveRole = useSalonStore((s) => s.setActiveRole);
  const clockMins = useSalonStore((s) => s.clockMins);
  const advanceClock = useSalonStore((s) => s.advanceClock);
  const chairs = useSalonStore((s) => s.chairs);
  const completeChairCheckout = useSalonStore((s) => s.completeChairCheckout);
  const resetDemo = useSalonStore((s) => s.resetDemo);

  const chair1Active = Boolean(chairs[0]?.customerName);

  return (
    <header className="w-full border-b border-[var(--sd-line)]">
      <div className="w-full fluid-px py-5 flex flex-wrap items-center justify-between gap-y-4 gap-x-8">
        <div className="flex flex-wrap items-baseline gap-x-8 sm:gap-x-12 gap-y-2">
          <button
            type="button"
            onClick={() => setActiveRole('customer')}
            className="inline-flex items-center gap-3 text-[var(--sd-ink)] cursor-pointer"
            aria-label="SalonDesk home"
          >
            <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect width="32" height="32" rx="2" fill="#1A1714" />
              <path d="M10 9L22 25M22 9L10 25" stroke="#F4EFE6" stroke-width="1.8" stroke-linecap="square" />
              <circle cx="10" cy="9" r="2.2" fill="#1F4D3A" stroke="#F4EFE6" stroke-width="1.2" />
              <circle cx="22" cy="9" r="2.2" fill="#1F4D3A" stroke="#F4EFE6" stroke-width="1.2" />
              <rect y="29" width="32" height="3" fill="#1F4D3A" />
            </svg>
            <span className="font-serif-display text-3xl leading-none">SalonDesk</span>
          </button>

          <nav className="flex items-center gap-6 sm:gap-9 text-[14px]" aria-label="Primary Workspace">
            {NAV_ITEMS.map((item) => {
              const active = activeRole === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveRole(item.id)}
                  className={`relative py-1 cursor-pointer ${
                    active ? 'font-semibold text-[var(--sd-ink)]' : 'text-[var(--sd-muted)] hover:text-[var(--sd-ink)]'
                  }`}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="masthead-nav-rule"
                      className="absolute left-0 right-0 -bottom-[21px] h-[2px] bg-[var(--sd-ink)] hidden sm:block"
                      transition={{ type: 'spring', stiffness: 520, damping: 38 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-5 sm:gap-6 text-[13px] tabular">
          <span className="font-mono-code text-[var(--sd-muted)]" aria-label="Salon clock">
            {formatClock(clockMins)}
          </span>
          <button
            type="button"
            onClick={() => advanceClock(5)}
            className="underline underline-offset-4 text-[var(--sd-ink)] hover:text-[var(--sd-brand)] cursor-pointer"
            title="Advance salon clock by 5 minutes"
          >
            +5 min
          </button>
          <button
            type="button"
            disabled={!chair1Active}
            onClick={() =>
              completeChairCheckout({
                chairId: 'chair-1',
                addonProductIds: [],
                tipAmount: 0,
                paymentMethod: 'UPI',
              })
            }
            className="underline underline-offset-4 font-medium text-[var(--sd-alert)] disabled:opacity-40 cursor-pointer"
            title="Complete Chair 01 cut and trigger live ETA ripple"
          >
            Finish Chair 01
          </button>
          <button
            type="button"
            onClick={resetDemo}
            className="inline-flex items-center gap-1.5 text-[var(--sd-muted)] hover:text-[var(--sd-ink)] cursor-pointer"
            title="Reset demo seed data"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.6} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
}
