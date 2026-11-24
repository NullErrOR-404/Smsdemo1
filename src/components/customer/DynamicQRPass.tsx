import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { QRCodeSVG } from 'qrcode.react';
import { formatClock, formatINR, useSalonStore } from '../../store/useSalonStore';
import { AnimatedNumber } from '../erp/AnimatedNumber';

export function DynamicQRPass() {
  const queue = useSalonStore((s) => s.queue);
  const stylists = useSalonStore((s) => s.stylists);
  const clockMins = useSalonStore((s) => s.clockMins);
  const advanceClock = useSalonStore((s) => s.advanceClock);
  const setActiveRole = useSalonStore((s) => s.setActiveRole);

  const ticket =
    queue.find((q) => q.isCurrentUser) ??
    queue.find((q) => q.status === 'In queue' || q.status === 'Leave now' || q.status === 'Checked in') ??
    queue[0];

  const stubRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!stubRef.current || !ticket) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        stubRef.current,
        { y: 6, opacity: 0.9 },
        { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out', clearProps: 'transform,opacity' }
      );
    }, stubRef);
    return () => ctx.revert();
  }, [ticket?.code, ticket?.status]);

  if (!ticket) {
    return (
      <div className="bg-[var(--sd-surface)] p-8 sm:p-10 border border-[var(--sd-line)]">
        <p className="font-serif-display text-3xl">No active queue pass</p>
        <p className="text-[14px] text-[var(--sd-muted)] mt-2">
          Select a service on the left to issue your live QR pass.
        </p>
      </div>
    );
  }

  const stylist = stylists.find((s) => s.id === ticket.stylistId);
  const isLeaveNow = ticket.status === 'Leave now';
  const isCheckedIn = ticket.status === 'Checked in';

  const topRuleColor = isLeaveNow
    ? 'var(--sd-alert)'
    : isCheckedIn
      ? 'var(--sd-brand)'
      : 'var(--sd-ink)';

  const qrFgColor = isLeaveNow ? '#C83E2B' : isCheckedIn ? '#1F4D3A' : '#1A1714';

  const qrPayload = JSON.stringify({
    app: 'SalonDesk',
    code: ticket.code,
    guest: ticket.customerName,
    chair: stylist?.chairNumber ?? '01',
    eta: ticket.etaMins,
    status: ticket.status,
  });

  const alertTimeStr = formatClock(clockMins + Math.max(0, ticket.etaMins - 15));

  return (
    <div ref={stubRef} className="bg-[var(--sd-surface)] border border-[var(--sd-line)]">
      {/* Physical State Bar */}
      <div className="h-2 w-full" style={{ backgroundColor: topRuleColor }} />

      <div className="p-8 sm:p-10 space-y-8">
        <div className="flex items-baseline justify-between border-b border-[var(--sd-line)] pb-5">
          <div>
            <p className="text-[12px] text-[var(--sd-muted)]">Queue pass</p>
            <p className="font-mono-code text-2xl font-semibold tabular mt-1">{ticket.code}</p>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-[var(--sd-muted)]">State</p>
            <p className="text-[15px] font-semibold mt-1" style={{ color: topRuleColor }}>
              {ticket.status}
            </p>
          </div>
        </div>

        {/* Giant Departure Countdown */}
        <div className="flex items-end justify-between border-b border-[var(--sd-line)] pb-7">
          <div>
            <p className="text-[13px] text-[var(--sd-muted)]">
              {ticket.mode === 'slot' && ticket.scheduledSlot
                ? `Reserved for ${ticket.scheduledSlot}`
                : 'Estimated turn in'}
            </p>
            <p className="font-serif-display text-6xl sm:text-7xl leading-none mt-2 text-[var(--sd-ink)]">
              <AnimatedNumber value={ticket.etaMins} suffix=" min" />
            </p>
          </div>
          <div className="text-right text-[13px] tabular">
            <p className="text-[var(--sd-muted)]">15-min alert</p>
            <p className="font-medium text-[var(--sd-ink)] mt-1">
              {isLeaveNow
                ? 'Sent (WhatsApp + Push)'
                : isCheckedIn
                  ? 'QR verified at desk'
                  : `Armed for ${alertTimeStr}`}
            </p>
          </div>
        </div>

        {/* Scannable Dynamic QR */}
        <div className="flex flex-col sm:flex-row items-center gap-8 py-2">
          <div className="p-3 bg-white border border-[var(--sd-line)] shrink-0">
            <QRCodeSVG value={qrPayload} size={132} fgColor={qrFgColor} bgColor="#FFFFFF" level="M" />
          </div>
          <div className="w-full space-y-3 text-[14px]">
            <div className="flex justify-between gap-3 border-b border-[var(--sd-line)] pb-2">
              <span className="text-[var(--sd-muted)]">Guest</span>
              <span className="font-medium text-right">{ticket.customerName}</span>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--sd-line)] pb-2">
              <span className="text-[var(--sd-muted)]">Chair</span>
              <span className="font-medium text-right">
                Chair {stylist?.chairNumber ?? '01'}, {stylist?.name ?? 'Assigned'}
              </span>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--sd-line)] pb-2">
              <span className="text-[var(--sd-muted)]">Service</span>
              <span className="font-medium text-right">{ticket.serviceSummary}</span>
            </div>
            <div className="flex justify-between gap-3 pt-1">
              <span className="text-[var(--sd-muted)]">Estimate</span>
              <span className="font-semibold tabular">{formatINR(ticket.estimatedPrice)}</span>
            </div>
          </div>
        </div>

        {/* Live Test Strip */}
        <div className="pt-5 border-t border-[var(--sd-line)] flex flex-wrap items-center justify-between gap-4 text-[13px]">
          <button
            type="button"
            onClick={() => advanceClock(5)}
            className="underline underline-offset-4 text-[var(--sd-ink)] hover:text-[var(--sd-brand)] cursor-pointer"
          >
            Simulate +5 min
          </button>
          <button
            type="button"
            onClick={() => setActiveRole('desk')}
            className="underline underline-offset-4 font-medium text-[var(--sd-brand)] cursor-pointer"
          >
            Open Floor Desk
          </button>
        </div>
      </div>
    </div>
  );
}
