import { useState } from 'react';
import { motion } from 'motion/react';
import { QrCode, UserPlus } from 'lucide-react';
import { SERVICES } from '../../data/seed';
import { formatINR, useSalonStore } from '../../store/useSalonStore';
import type { ChairState } from '../../types/salon';
import { PosCheckoutDrawer } from './PosCheckoutDrawer';

export function FloorDesk() {
  const chairs = useSalonStore((s) => s.chairs);
  const stylists = useSalonStore((s) => s.stylists);
  const queue = useSalonStore((s) => s.queue);
  const bookTicket = useSalonStore((s) => s.bookTicket);
  const checkInTicket = useSalonStore((s) => s.checkInTicket);
  const skipNoShow = useSalonStore((s) => s.skipNoShow);

  const [checkoutChair, setCheckoutChair] = useState<ChairState | null>(null);
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [walkName, setWalkName] = useState('');
  const [walkServiceId, setWalkServiceId] = useState('fade');
  const [walkStylistId, setWalkStylistId] = useState('any');
  const [qrInput, setQrInput] = useState('');
  const [qrMessage, setQrMessage] = useState<string | null>(null);

  const activeQueue = queue.filter((q) => q.status !== 'Completed' && q.status !== 'No-show');

  const handleWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    bookTicket({
      customerName: walkName.trim() || 'Walk-in Guest',
      serviceIds: [walkServiceId],
      stylistId: walkStylistId,
      mode: 'live',
      channel: 'Walk-in',
    });
    setWalkName('');
    setWalkInOpen(false);
  };

  const handleQrVerify = (codeToCheck?: string) => {
    const query = (codeToCheck ?? qrInput).trim().toUpperCase();
    const target = activeQueue.find(
      (q) => q.code.toUpperCase() === query || (!query && q.status !== 'Checked in')
    );
    if (!target) {
      setQrMessage(`No waiting pass found for "${query || 'scan'}".`);
      return;
    }
    checkInTicket(target.id);
    setQrInput('');
    setQrMessage(`Verified ${target.code} (${target.customerName}) — marked Checked in.`);
  };

  return (
    <div className="space-y-14" data-lenis-prevent>
      {/* Header Controls */}
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[var(--sd-line)] pb-8">
        <div>
          <h1 className="font-serif-display text-4xl sm:text-5xl leading-none">Floor Desk</h1>
          <p className="text-[14px] text-[var(--sd-muted)] mt-2.5">
            Finishing a chair or adding a walk-in immediately recalculates every waiting guest&apos;s ETA.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[13px]">
          <div className="flex items-stretch border border-[var(--sd-line)] bg-[var(--sd-surface)]">
            <input
              type="text"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="Pass code (SD-104)"
              aria-label="Verify QR ticket code"
              className="px-3.5 py-2.5 text-[13px] w-44 bg-transparent focus:outline-none font-mono-code"
            />
            <button
              type="button"
              onClick={() => handleQrVerify()}
              className="px-4 py-2.5 border-l border-[var(--sd-line)] hover:bg-[var(--sd-tint)] inline-flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <QrCode className="w-4 h-4" strokeWidth={1.6} />
              Verify QR
            </button>
          </div>

          <button
            type="button"
            onClick={() => setWalkInOpen((prev) => !prev)}
            className="bg-[var(--sd-brand)] hover:bg-[var(--sd-brand-hover)] text-white px-5 py-2.5 font-medium inline-flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" strokeWidth={1.6} />
            2-Tap Walk-In
          </button>
        </div>
      </div>

      {qrMessage && (
        <div className="bg-[var(--sd-surface)] border-l-4 border-[var(--sd-brand)] px-5 py-3.5 flex items-center justify-between text-[13px]">
          <span>{qrMessage}</span>
          <button type="button" onClick={() => setQrMessage(null)} className="underline text-[12px] cursor-pointer">
            Close
          </button>
        </div>
      )}

      {/* 2-Tap Walk-In Form */}
      {walkInOpen && (
        <form
          onSubmit={handleWalkIn}
          className="bg-[var(--sd-surface)] border border-[var(--sd-line)] p-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end"
        >
          <div className="sm:col-span-4 space-y-1.5">
            <label className="text-[12px] text-[var(--sd-muted)]">Guest name</label>
            <input
              type="text"
              value={walkName}
              onChange={(e) => setWalkName(e.target.value)}
              placeholder="Walk-in guest name"
              className="w-full border border-[var(--sd-line)] px-3.5 py-2.5 text-[13px]"
            />
          </div>
          <div className="sm:col-span-3 space-y-1.5">
            <label className="text-[12px] text-[var(--sd-muted)]">Service</label>
            <select
              value={walkServiceId}
              onChange={(e) => setWalkServiceId(e.target.value)}
              className="w-full border border-[var(--sd-line)] px-3.5 py-2.5 text-[13px] bg-white"
            >
              {SERVICES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.durationMins}m, {formatINR(s.price)})
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-3 space-y-1.5">
            <label className="text-[12px] text-[var(--sd-muted)]">Stylist</label>
            <select
              value={walkStylistId}
              onChange={(e) => setWalkStylistId(e.target.value)}
              className="w-full border border-[var(--sd-line)] px-3.5 py-2.5 text-[13px] bg-white"
            >
              <option value="any">First available</option>
              {stylists.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} (Chair {st.chairNumber})
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full bg-[var(--sd-ink)] text-white py-2.5 px-4 text-[13px] font-medium cursor-pointer"
            >
              Add to line
            </button>
          </div>
        </form>
      )}

      {/* 3 Open-Air Live Chairs (Hairline Rules Only, Zero Heavy Outer Boxes) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 border-b border-[var(--sd-line)] pb-12">
        {chairs.map((chair) => {
          const stylist = stylists.find((s) => s.id === chair.stylistId);
          const elapsedPct =
            chair.totalMins > 0
              ? Math.min(100, Math.round(((chair.totalMins - chair.remainingMins) / chair.totalMins) * 100))
              : 0;
          return (
            <div key={chair.id} className="flex flex-col justify-between gap-6">
              <div className="flex items-baseline justify-between">
                <span className="font-mono-code text-[12px] text-[var(--sd-muted)]">
                  CHAIR {chair.chairNumber} — {stylist?.name}
                </span>
                <span className="text-[13px] font-semibold tabular text-[var(--sd-alert)]">
                  {chair.customerName ? `${chair.remainingMins}m left` : 'Open'}
                </span>
              </div>

              {chair.customerName ? (
                <>
                  <div className="space-y-1">
                    <p className="font-serif-display text-3xl leading-tight">{chair.customerName}</p>
                    <p className="text-[13px] text-[var(--sd-muted)]">
                      {chair.serviceSummary}, {formatINR(chair.servicePrice)}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="w-full h-1 bg-[var(--sd-tint)]">
                      <div
                        className="h-full bg-[var(--sd-brand)] transition-all duration-300"
                        style={{ width: `${elapsedPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[var(--sd-muted)] tabular">{elapsedPct}% elapsed</span>
                      <button
                        type="button"
                        onClick={() => setCheckoutChair(chair)}
                        className="underline underline-offset-4 font-semibold text-[var(--sd-brand)] cursor-pointer"
                      >
                        Finish and POS checkout
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-[14px] text-[var(--sd-muted)] py-6">
                  Chair is currently open. Add a walk-in or wait for the next booking.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Open-Air Unified Live Queue Ledger */}
      <div className="space-y-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[16px] font-semibold">Unified queue ledger</h2>
          <span className="text-[13px] text-[var(--sd-muted)] tabular">{activeQueue.length} waiting</span>
        </div>

        <div className="overflow-x-auto border-t border-b border-[var(--sd-line)]">
          <table className="w-full text-left border-collapse text-[14px]">
            <thead>
              <tr className="border-b border-[var(--sd-line)] text-[12px] text-[var(--sd-muted)]">
                <th className="py-4 pr-4 font-medium">Pass</th>
                <th className="py-4 px-4 font-medium">Guest</th>
                <th className="py-4 px-4 font-medium">Channel</th>
                <th className="py-4 px-4 font-medium">Service</th>
                <th className="py-4 px-4 font-medium">Stylist</th>
                <th className="py-4 px-4 font-medium text-right">Live ETA</th>
                <th className="py-4 px-4 font-medium">State</th>
                <th className="py-4 pl-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--sd-line)]">
              {activeQueue.map((ticket) => {
                const st = stylists.find((s) => s.id === ticket.stylistId);
                const stateColor =
                  ticket.status === 'Leave now'
                    ? 'text-[var(--sd-alert)] font-semibold'
                    : ticket.status === 'Checked in'
                      ? 'text-[var(--sd-brand)] font-semibold'
                      : 'text-[var(--sd-ink)]';
                return (
                  <motion.tr
                    key={ticket.id}
                    layout
                    transition={{ type: 'spring', stiffness: 450, damping: 36 }}
                    className="hover:bg-[var(--sd-surface)]/70"
                  >
                    <td className="py-4.5 pr-4 font-mono-code text-[13px] font-medium tabular">{ticket.code}</td>
                    <td className="py-4.5 px-4 font-medium">
                      {ticket.customerName}
                      {ticket.scheduledSlot && (
                        <span className="block text-[12px] text-[var(--sd-muted)] font-normal">
                          Slot {ticket.scheduledSlot}
                        </span>
                      )}
                    </td>
                    <td className="py-4.5 px-4 text-[var(--sd-muted)] text-[13px]">{ticket.channel}</td>
                    <td className="py-4.5 px-4 text-[13px]">{ticket.serviceSummary}</td>
                    <td className="py-4.5 px-4 text-[13px]">{st?.name ?? 'Assigned'}</td>
                    <td className="py-4.5 px-4 text-right font-semibold tabular">{ticket.etaMins} min</td>
                    <td className={`py-4.5 px-4 text-[13px] ${stateColor}`}>{ticket.status}</td>
                    <td className="py-4.5 pl-4 text-right space-x-4 whitespace-nowrap text-[13px]">
                      {ticket.status !== 'Checked in' && (
                        <button
                          type="button"
                          onClick={() => checkInTicket(ticket.id)}
                          className="underline underline-offset-4 text-[var(--sd-brand)] font-medium cursor-pointer"
                        >
                          Check in
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => skipNoShow(ticket.id)}
                        className="underline underline-offset-4 text-[var(--sd-muted)] hover:text-[var(--sd-alert)] cursor-pointer"
                      >
                        No-show
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
              {activeQueue.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[var(--sd-muted)]">
                    Queue is clear. Add a walk-in or book from the Customer Portal.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PosCheckoutDrawer chair={checkoutChair} onClose={() => setCheckoutChair(null)} />
    </div>
  );
}
