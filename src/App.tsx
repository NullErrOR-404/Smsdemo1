import { AnimatePresence, motion } from 'motion/react';
import { AlertBanner } from './components/AlertBanner';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { FloorDesk } from './components/desk/FloorDesk';
import { OwnerERP } from './components/erp/OwnerERP';
import { Masthead } from './components/Masthead';
import { useScopedLenis } from './hooks/useLenis';
import { useSalonStore } from './store/useSalonStore';

export default function App() {
  const activeRole = useSalonStore((s) => s.activeRole);

  // Scoped Lenis smooth scroll: active on Customer Portal editorial scroll, native on Desk/ERP tables
  useScopedLenis(activeRole === 'customer');

  return (
    <div className="min-h-screen w-full flex flex-col">
      <Masthead />
      <AlertBanner />

      <main className="flex-1 w-full fluid-px py-10 sm:py-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRole}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="w-full"
          >
            {activeRole === 'customer' && <CustomerPortal />}
            {activeRole === 'desk' && <FloorDesk />}
            {activeRole === 'erp' && <OwnerERP />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="w-full border-t border-[var(--sd-line)] fluid-px py-8 text-[12px] text-[var(--sd-muted)] flex flex-wrap items-center justify-between gap-4">
        <span>SalonDesk — Live Queue, Dynamic QR Pass, and Salon ERP</span>
        <span>Open in two browser tabs to watch Customer and Floor Desk sync live.</span>
      </footer>
    </div>
  );
}
