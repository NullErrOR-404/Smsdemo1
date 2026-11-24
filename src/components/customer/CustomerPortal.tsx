import { useState } from 'react';
import { FUTURE_SLOTS, SERVICES } from '../../data/seed';
import { formatINR, useSalonStore } from '../../store/useSalonStore';
import type { BookingMode } from '../../types/salon';
import { DepartureBoard } from '../DepartureBoard';
import { DynamicQRPass } from './DynamicQRPass';

export function CustomerPortal() {
  const stylists = useSalonStore((s) => s.stylists);
  const chairs = useSalonStore((s) => s.chairs);
  const queue = useSalonStore((s) => s.queue);
  const bookTicket = useSalonStore((s) => s.bookTicket);

  const [mode, setMode] = useState<BookingMode>('live');
  const [selectedSlot, setSelectedSlot] = useState(FUTURE_SLOTS[2]);
  const [selectedServices, setSelectedServices] = useState<string[]>(['fade']);
  const [selectedStylist, setSelectedStylist] = useState<string>('rohan');
  const [customerName, setCustomerName] = useState('Pranav Kulkarni');
  const [phone, setPhone] = useState('+91 98192 77310');

  const toggleService = (id: string) => {
    setSelectedServices((prev) => {
      if (prev.includes(id)) {
        return prev.length > 1 ? prev.filter((item) => item !== id) : prev;
      }
      return [...prev, id];
    });
  };

  const getWaitForStylist = (stylistId: string) => {
    const chair = chairs.find((c) => c.stylistId === stylistId);
    let wait = chair ? chair.remainingMins : 0;
    for (const q of queue) {
      if (q.stylistId === stylistId && (q.status === 'In queue' || q.status === 'Leave now' || q.status === 'Checked in')) {
        wait += q.totalMins;
      }
    }
    return wait;
  };

  const waitingCount = queue.filter(
    (q) => q.status === 'In queue' || q.status === 'Leave now' || q.status === 'Checked in'
  ).length;
  const minWait = Math.min(...stylists.map((s) => getWaitForStylist(s.id)));
  const pickedList = SERVICES.filter((s) => selectedServices.includes(s.id));
  const totalMins = pickedList.reduce((acc, s) => acc + s.durationMins, 0);
  const totalPrice = pickedList.reduce((acc, s) => acc + s.price, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
    bookTicket({
      customerName,
      phone,
      serviceIds: selectedServices,
      stylistId: selectedStylist,
      mode,
      scheduledSlot: mode === 'slot' ? selectedSlot : undefined,
      channel: 'Online QR',
      asCurrentUser: true,
    });
  };

  return (
    <div className="w-full space-y-16 sm:space-y-24">
      {/* Full-Width Edge-to-Edge Editorial Hero */}
      <section className="w-full pt-2 sm:pt-8 space-y-12 sm:space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-end">
          <div className="lg:col-span-7 space-y-6 min-w-0">
            <h1 className="hero-display text-[var(--sd-ink)] break-words">
              Walk in when your chair opens.
            </h1>
            <p className="text-[16px] sm:text-[18px] leading-relaxed text-[var(--sd-muted)] max-w-[58ch]">
              Join today&apos;s live chair queue or reserve a later hour. Your QR pass recalculates automatically and notifies you 15 minutes before your turn.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-8 text-[14px]">
              <a
                href="#booking-stage"
                className="bg-[var(--sd-brand)] hover:bg-[var(--sd-brand-hover)] text-white px-7 py-3.5 font-medium"
              >
                Reserve your chair
              </a>
              <span className="text-[var(--sd-muted)] tabular">
                Shortest wait right now: <strong className="text-[var(--sd-ink)] font-semibold">{minWait} minutes</strong>
              </span>
            </div>
          </div>

          {/* Right Ultrawide Balance: Clean Live Floor Summary */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-6 border-t lg:border-t-0 lg:border-l border-[var(--sd-line)] pt-6 lg:pt-0 lg:pl-12 tabular">
            <div>
              <p className="text-[12px] text-[var(--sd-muted)]">Next opening</p>
              <p className="kpi-display mt-2 text-[var(--sd-ink)]">{minWait}m</p>
            </div>
            <div>
              <p className="text-[12px] text-[var(--sd-muted)]">Guests waiting</p>
              <p className="kpi-display mt-2 text-[var(--sd-ink)]">{waitingCount}</p>
            </div>
            <div>
              <p className="text-[12px] text-[var(--sd-muted)]">Turn alert</p>
              <p className="kpi-display mt-2 text-[var(--sd-alert)]">15m</p>
            </div>
          </div>
        </div>

        {/* Full-Width Live Chair Standing Strip */}
        <DepartureBoard />
      </section>

      {/* Full-Width Fluid Booking & Sticky QR Stub Stage */}
      <section
        id="booking-stage"
        className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20 items-start scroll-mt-10 pb-8"
      >
        {/* Left 7–8 Cols: Open-Air Broadsheet Service Menu */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 2xl:col-span-8 space-y-12 min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--sd-line-strong)] pb-4">
            <div className="flex items-baseline gap-8 text-[15px]">
              <button
                type="button"
                onClick={() => setMode('live')}
                className={`cursor-pointer ${
                  mode === 'live'
                    ? 'font-semibold text-[var(--sd-ink)] underline underline-offset-[18px] decoration-2'
                    : 'text-[var(--sd-muted)] hover:text-[var(--sd-ink)]'
                }`}
              >
                Join live queue
              </button>
              <button
                type="button"
                onClick={() => setMode('slot')}
                className={`cursor-pointer ${
                  mode === 'slot'
                    ? 'font-semibold text-[var(--sd-ink)] underline underline-offset-[18px] decoration-2'
                    : 'text-[var(--sd-muted)] hover:text-[var(--sd-ink)]'
                }`}
              >
                Reserve later today
              </button>
            </div>
            <span className="text-[13px] text-[var(--sd-muted)] tabular">
              {pickedList.length} selected, {totalMins} min, {formatINR(totalPrice)}
            </span>
          </div>

          {/* Future Time Slots */}
          {mode === 'slot' && (
            <div className="space-y-4">
              <p className="text-[13px] text-[var(--sd-muted)]">Select hour today</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {FUTURE_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-3 text-[13px] tabular border cursor-pointer ${
                      selectedSlot === slot
                        ? 'bg-[var(--sd-brand)] border-[var(--sd-brand)] text-white font-medium'
                        : 'bg-transparent border-[var(--sd-line)] hover:border-[var(--sd-ink)] text-[var(--sd-ink)]'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Open Hairline Service Menu (1-col on mobile/laptop, 2-col on 2xl ultrawide) */}
          <div className="space-y-3">
            <p className="text-[13px] text-[var(--sd-muted)]">1. Choose services</p>
            <div className="border-t border-b border-[var(--sd-line)] grid grid-cols-1 2xl:grid-cols-2 divide-y divide-[var(--sd-line)] 2xl:gap-x-10">
              {SERVICES.map((svc) => {
                const active = selectedServices.includes(svc.id);
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => toggleService(svc.id)}
                    className={`w-full px-4 py-5 flex items-center justify-between gap-4 text-left cursor-pointer transition-colors ${
                      active ? 'bg-[var(--sd-tint)]' : 'hover:bg-[var(--sd-surface)]/60'
                    }`}
                  >
                    <div className="flex items-baseline gap-4 min-w-0">
                      <span className="font-mono-code text-[12px] text-[var(--sd-muted)] shrink-0">
                        {svc.index}
                      </span>
                      <span className={`text-[15px] truncate ${active ? 'font-semibold text-[var(--sd-ink)]' : 'text-[var(--sd-ink)]'}`}>
                        {svc.name}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-6 sm:gap-8 shrink-0 tabular">
                      <span className="text-[13px] text-[var(--sd-muted)]">{svc.durationMins} min</span>
                      <span className={`text-[15px] w-16 text-right ${active ? 'text-[var(--sd-brand)] font-semibold' : 'font-medium'}`}>
                        {formatINR(svc.price)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Open Stylist Selector */}
          <div className="space-y-4">
            <p className="text-[13px] text-[var(--sd-muted)]">2. Choose stylist</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setSelectedStylist('any')}
                className={`p-4 text-left border cursor-pointer transition-colors ${
                  selectedStylist === 'any'
                    ? 'bg-[var(--sd-brand)] border-[var(--sd-brand)] text-white'
                    : 'bg-transparent border-[var(--sd-line)] hover:border-[var(--sd-ink)] text-[var(--sd-ink)]'
                }`}
              >
                <p className="text-[14px] font-medium">First available</p>
                <p className={`text-[12px] tabular mt-1 ${selectedStylist === 'any' ? 'text-white/80' : 'text-[var(--sd-muted)]'}`}>
                  ~{minWait} min wait
                </p>
              </button>

              {stylists.map((st) => {
                const wait = getWaitForStylist(st.id);
                const active = selectedStylist === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStylist(st.id)}
                    className={`p-4 text-left border cursor-pointer transition-colors ${
                      active
                        ? 'bg-[var(--sd-brand)] border-[var(--sd-brand)] text-white'
                        : 'bg-transparent border-[var(--sd-line)] hover:border-[var(--sd-ink)] text-[var(--sd-ink)]'
                    }`}
                  >
                    <p className="text-[14px] font-medium truncate">{st.name}</p>
                    <p className={`text-[12px] tabular mt-1 ${active ? 'text-white/80' : 'text-[var(--sd-muted)]'}`}>
                      Chair {st.chairNumber}, {wait}m
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Guest Details & Issue Pass */}
          <div className="space-y-4">
            <p className="text-[13px] text-[var(--sd-muted)]">3. Your details for the 15-minute alert</p>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Your full name"
                aria-label="Customer name"
                className="sm:col-span-5 bg-[var(--sd-surface)] border border-[var(--sd-line)] focus:border-[var(--sd-ink)] px-4 py-3 text-[14px]"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="WhatsApp / SMS number"
                aria-label="Phone number"
                className="sm:col-span-4 bg-[var(--sd-surface)] border border-[var(--sd-line)] focus:border-[var(--sd-ink)] px-4 py-3 text-[14px] tabular"
              />
              <button
                type="submit"
                className="sm:col-span-3 bg-[var(--sd-brand)] hover:bg-[var(--sd-brand-hover)] text-white px-5 py-3 text-[14px] font-medium cursor-pointer"
              >
                Issue QR Pass
              </button>
            </div>
          </div>
        </form>

        {/* Right 5–4 Cols: Sticky Physical QR Pass Stub */}
        <div className="lg:col-span-5 2xl:col-span-4 lg:sticky lg:top-10 min-w-0">
          <DynamicQRPass />
        </div>
      </section>
    </div>
  );
}
