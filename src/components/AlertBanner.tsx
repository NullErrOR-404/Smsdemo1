import { AnimatePresence, motion } from 'motion/react';
import { BellRing } from 'lucide-react';
import { useSalonStore } from '../store/useSalonStore';

export function AlertBanner() {
  const activeAlert = useSalonStore((s) => s.activeAlert);
  const dismissAlert = useSalonStore((s) => s.dismissAlert);

  return (
    <AnimatePresence>
      {activeAlert && (
        <motion.div
          key={activeAlert.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
          className="w-full bg-[var(--sd-alert)] text-white border-b border-[var(--sd-ink)]"
          role="status"
          aria-live="polite"
        >
          <div className="w-full fluid-px py-3.5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3 text-[13px]">
              <BellRing className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" strokeWidth={1.75} />
              <div>
                <span className="font-semibold mr-2">15-minute turn alert ({activeAlert.channelNote}):</span>
                <span>{activeAlert.message}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={dismissAlert}
              className="text-[12px] underline underline-offset-4 cursor-pointer shrink-0"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
