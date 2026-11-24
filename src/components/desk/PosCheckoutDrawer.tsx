import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { formatINR, useSalonStore } from '../../store/useSalonStore';
import type { ChairState, PaymentMethod } from '../../types/salon';

interface PosCheckoutDrawerProps {
  chair: ChairState | null;
  onClose: () => void;
}

const TIPS = [0, 50, 100, 200];
const METHODS: PaymentMethod[] = ['UPI', 'Cash', 'Card'];

export function PosCheckoutDrawer({ chair, onClose }: PosCheckoutDrawerProps) {
  const inventory = useSalonStore((s) => s.inventory);
  const stylists = useSalonStore((s) => s.stylists);
  const completeChairCheckout = useSalonStore((s) => s.completeChairCheckout);

  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [tipAmount, setTipAmount] = useState<number>(50);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');

  const retailItems = inventory.filter((i) => i.category === 'Retail' && i.stock > 0);
  const stylist = chair ? stylists.find((s) => s.id === chair.stylistId) : null;
  const addonTotal = retailItems
    .filter((i) => selectedAddons.includes(i.id))
    .reduce((acc, i) => acc + i.retailPrice, 0);
  const grandTotal = (chair?.servicePrice ?? 0) + addonTotal + tipAmount;

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    if (!chair) return;
    completeChairCheckout({
      chairId: chair.id,
      addonProductIds: selectedAddons,
      tipAmount,
      paymentMethod,
    });
    setSelectedAddons([]);
    setTipAmount(50);
    onClose();
  };

  return (
    <AnimatePresence>
      {chair && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1A1714]/40 z-40"
          />
          <motion.aside
            data-lenis-prevent
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 38 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[var(--sd-surface)] border-l border-[var(--sd-line-strong)] z-50 flex flex-col overflow-y-auto"
            aria-label="POS Checkout"
          >
            <div className="p-6 border-b border-[var(--sd-line-strong)] flex items-center justify-between">
              <div>
                <p className="font-mono-code text-[12px] text-[var(--sd-muted)]">
                  CHAIR {chair.chairNumber} CHECKOUT
                </p>
                <h2 className="font-serif-display text-2xl mt-0.5">{chair.customerName}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-[var(--sd-muted)] hover:text-[var(--sd-ink)] cursor-pointer"
                aria-label="Close checkout drawer"
              >
                <X className="w-5 h-5" strokeWidth={1.6} />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              {/* Service Line */}
              <div className="border-b border-[var(--sd-line)] pb-4 space-y-1.5 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-[var(--sd-muted)]">Stylist</span>
                  <span className="font-medium">{stylist?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--sd-muted)]">Service</span>
                  <span className="font-medium text-right">{chair.serviceSummary}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-[var(--sd-muted)]">Service subtotal</span>
                  <span className="font-semibold tabular">{formatINR(chair.servicePrice)}</span>
                </div>
              </div>

              {/* Retail Add-ons (Auto-deducts Inventory) */}
              <div className="space-y-2.5">
                <div className="flex justify-between text-[12px] text-[var(--sd-muted)]">
                  <span>Retail product add-ons (auto-deducts stock)</span>
                  <span className="tabular">{formatINR(addonTotal)}</span>
                </div>
                <div className="border-t border-b border-[var(--sd-line)] divide-y divide-[var(--sd-line)]">
                  {retailItems.map((item) => {
                    const checked = selectedAddons.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleAddon(item.id)}
                        className={`w-full py-2.5 px-3 flex items-center justify-between text-left text-[13px] cursor-pointer ${
                          checked ? 'bg-[var(--sd-tint)] font-medium' : 'hover:bg-[var(--sd-paper)]'
                        }`}
                      >
                        <span className="truncate pr-3">
                          {checked ? '[x] ' : '[ ] '}
                          {item.name}
                        </span>
                        <span className="tabular shrink-0">{formatINR(item.retailPrice)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tip */}
              <div className="space-y-2">
                <p className="text-[12px] text-[var(--sd-muted)]">Stylist tip</p>
                <div className="grid grid-cols-4 border-t border-l border-[var(--sd-line)]">
                  {TIPS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTipAmount(t)}
                      className={`py-2 text-[13px] tabular border-r border-b border-[var(--sd-line)] cursor-pointer ${
                        tipAmount === t
                          ? 'bg-[var(--sd-ink)] text-white font-medium'
                          : 'bg-[var(--sd-surface)] hover:bg-[var(--sd-tint)]'
                      }`}
                    >
                      {t === 0 ? 'None' : formatINR(t)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <p className="text-[12px] text-[var(--sd-muted)]">Payment method</p>
                <div className="grid grid-cols-3 border-t border-l border-[var(--sd-line)]">
                  {METHODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-2.5 text-[13px] border-r border-b border-[var(--sd-line)] cursor-pointer ${
                        paymentMethod === m
                          ? 'bg-[var(--sd-brand)] text-white font-medium'
                          : 'bg-[var(--sd-surface)] hover:bg-[var(--sd-tint)]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[var(--sd-line-strong)] bg-[var(--sd-paper)] space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[14px] text-[var(--sd-muted)]">Total due ({paymentMethod})</span>
                <span className="font-serif-display text-3xl tabular">{formatINR(grandTotal)}</span>
              </div>
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full bg-[var(--sd-brand)] hover:bg-[var(--sd-brand-hover)] text-white py-3 text-[14px] font-medium cursor-pointer"
              >
                Collect {formatINR(grandTotal)} and seat next guest
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
