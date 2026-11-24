import { create } from 'zustand';
import {
  INITIAL_CHAIRS,
  INITIAL_CUSTOMERS,
  INITIAL_EXPENSES,
  INITIAL_INVENTORY,
  INITIAL_QUEUE,
  INITIAL_SALES,
  INITIAL_STYLISTS,
  SERVICES,
} from '../data/seed';
import type {
  ActiveAlert,
  BookingMode,
  ChairState,
  CustomerProfile,
  ExpenseCategory,
  ExpenseRecord,
  InventoryItem,
  PaymentMethod,
  QueueTicket,
  RoleView,
  SaleRecord,
  Stylist,
  TicketChannel,
} from '../types/salon';

const STORAGE_KEY = 'salondesk-state-v1';
const CHANNEL_NAME = 'salondesk-sync';
const TAB_ID = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Math.random());

const broadcast = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null;

export function formatClock(totalMins: number): string {
  const h24 = Math.floor(totalMins / 60) % 24;
  const mins = totalMins % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 || 12;
  return `${h12}:${String(mins).padStart(2, '0')} ${suffix}`;
}

export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

interface PersistedSlice {
  clockMins: number;
  nextTicketNum: number;
  stylists: Stylist[];
  chairs: ChairState[];
  queue: QueueTicket[];
  sales: SaleRecord[];
  expenses: ExpenseRecord[];
  customers: CustomerProfile[];
  inventory: InventoryItem[];
  activeAlert: ActiveAlert | null;
}

interface SalonStore extends PersistedSlice {
  activeRole: RoleView;
  setActiveRole: (role: RoleView) => void;
  dismissAlert: () => void;
  bookTicket: (input: {
    customerName: string;
    phone?: string;
    serviceIds: string[];
    stylistId: string; // 'any' or stylist id
    mode: BookingMode;
    scheduledSlot?: string;
    channel: TicketChannel;
    asCurrentUser?: boolean;
  }) => QueueTicket;
  advanceClock: (mins: number) => void;
  checkInTicket: (ticketId: string) => void;
  skipNoShow: (ticketId: string) => void;
  completeChairCheckout: (input: {
    chairId: string;
    addonProductIds: string[];
    tipAmount: number;
    paymentMethod: PaymentMethod;
  }) => void;
  addExpense: (input: { category: ExpenseCategory; note: string; amount: number }) => void;
  toggleStylistShift: (stylistId: string) => void;
  restockItem: (itemId: string, qty: number) => void;
  resetDemo: () => void;
  hydrateFromSync: (slice: PersistedSlice) => void;
}

function getDefaultSlice(): PersistedSlice {
  return {
    clockMins: 13 * 60 + 15, // 1:15 PM
    nextTicketNum: 107,
    stylists: structuredClone(INITIAL_STYLISTS),
    chairs: structuredClone(INITIAL_CHAIRS),
    queue: structuredClone(INITIAL_QUEUE),
    sales: structuredClone(INITIAL_SALES),
    expenses: structuredClone(INITIAL_EXPENSES),
    customers: structuredClone(INITIAL_CUSTOMERS),
    inventory: structuredClone(INITIAL_INVENTORY),
    activeAlert: null,
  };
}

function loadInitialSlice(): PersistedSlice {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultSlice();
    const parsed = JSON.parse(raw) as Partial<PersistedSlice>;
    if (!parsed.chairs || !parsed.queue || !parsed.stylists) return getDefaultSlice();
    return { ...getDefaultSlice(), ...parsed };
  } catch {
    return getDefaultSlice();
  }
}

function computeStylistWait(stylistId: string, chairs: ChairState[], queue: QueueTicket[]): number {
  const chair = chairs.find((c) => c.stylistId === stylistId);
  let wait = chair ? chair.remainingMins : 0;
  for (const t of queue) {
    if (t.stylistId === stylistId && (t.status === 'In queue' || t.status === 'Leave now' || t.status === 'Checked in')) {
      wait += t.totalMins;
    }
  }
  return wait;
}

function recalculateQueueAndAlerts(
  chairs: ChairState[],
  queue: QueueTicket[],
  stylists: Stylist[],
  prevAlert: ActiveAlert | null
): { queue: QueueTicket[]; alert: ActiveAlert | null } {
  const runningWait: Record<string, number> = {};
  for (const c of chairs) {
    runningWait[c.stylistId] = c.remainingMins;
  }

  let triggeredAlert = prevAlert;

  const updatedQueue = queue.map((ticket) => {
    if (ticket.status === 'Completed' || ticket.status === 'No-show' || ticket.status === 'In chair') {
      return ticket;
    }
    const baseWait = runningWait[ticket.stylistId] ?? 0;
    const newEta = Math.max(0, baseWait);
    runningWait[ticket.stylistId] = newEta + ticket.totalMins;

    let nextStatus = ticket.status;
    let alertSent = ticket.alertSent;

    if (newEta <= 15 && ticket.status === 'In queue') {
      nextStatus = 'Leave now';
      if (!alertSent) {
        alertSent = true;
        const stylistName = stylists.find((s) => s.id === ticket.stylistId)?.name ?? 'your stylist';
        if (ticket.isCurrentUser || !triggeredAlert) {
          triggeredAlert = {
            id: `alert-${ticket.code}-${Date.now()}`,
            ticketCode: ticket.code,
            customerName: ticket.customerName,
            stylistName,
            etaMins: newEta,
            channelNote: 'WhatsApp + Push dispatched',
            message: `Pass ${ticket.code} (${ticket.customerName}) — estimated turn with ${stylistName} in ${newEta} min. Head to SalonDesk now.`,
          };
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification(`SalonDesk — Turn in ${newEta} min`, {
              body: `Pass ${ticket.code} with ${stylistName}. Head to the salon now.`,
            });
          }
        }
      }
    }

    return {
      ...ticket,
      etaMins: newEta,
      status: nextStatus,
      alertSent,
    };
  });

  return { queue: updatedQueue, alert: triggeredAlert };
}

function persistAndBroadcast(state: SalonStore) {
  const slice: PersistedSlice = {
    clockMins: state.clockMins,
    nextTicketNum: state.nextTicketNum,
    stylists: state.stylists,
    chairs: state.chairs,
    queue: state.queue,
    sales: state.sales,
    expenses: state.expenses,
    customers: state.customers,
    inventory: state.inventory,
    activeAlert: state.activeAlert,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slice));
  } catch {
    // ignore storage quota errors
  }
  broadcast?.postMessage({ sender: TAB_ID, slice });
}

export const useSalonStore = create<SalonStore>((set, get) => ({
  ...loadInitialSlice(),
  activeRole: 'customer',

  setActiveRole: (role) => set({ activeRole: role }),
  dismissAlert: () => {
    set({ activeAlert: null });
    persistAndBroadcast(get());
  },

  bookTicket: ({ customerName, phone = '+91 98200 00000', serviceIds, stylistId, mode, scheduledSlot, channel, asCurrentUser }) => {
    const state = get();
    const pickedServices = SERVICES.filter((s) => serviceIds.includes(s.id));
    const safeServices = pickedServices.length > 0 ? pickedServices : [SERVICES[0]];
    const totalMins = safeServices.reduce((acc, s) => acc + s.durationMins, 0);
    const estimatedPrice = safeServices.reduce((acc, s) => acc + s.price, 0);
    const serviceSummary = safeServices.map((s) => s.name).join(' + ');

    let resolvedStylistId = stylistId;
    if (stylistId === 'any') {
      const activeStylists = state.stylists.filter((s) => s.status === 'Active');
      const candidates = activeStylists.length > 0 ? activeStylists : state.stylists;
      resolvedStylistId = candidates.reduce((best, curr) => {
        const bestWait = computeStylistWait(best.id, state.chairs, state.queue);
        const currWait = computeStylistWait(curr.id, state.chairs, state.queue);
        return currWait < bestWait ? curr : best;
      }, candidates[0]).id;
    }

    const code = `SD-${state.nextTicketNum}`;
    const newTicket: QueueTicket = {
      id: `t-${state.nextTicketNum}-${Date.now()}`,
      code,
      customerName: customerName.trim() || 'Walk-in Guest',
      phone,
      channel,
      mode,
      scheduledSlot: mode === 'slot' ? scheduledSlot : undefined,
      serviceIds: safeServices.map((s) => s.id),
      serviceSummary,
      totalMins,
      estimatedPrice,
      stylistId: resolvedStylistId,
      etaMins: computeStylistWait(resolvedStylistId, state.chairs, state.queue),
      status: 'In queue',
      createdAtMins: state.clockMins,
      alertSent: false,
      isCurrentUser: Boolean(asCurrentUser),
    };

    const nextQueueBase = asCurrentUser
      ? [...state.queue.map((q) => ({ ...q, isCurrentUser: false })), newTicket]
      : [...state.queue, newTicket];

    const { queue, alert } = recalculateQueueAndAlerts(state.chairs, nextQueueBase, state.stylists, state.activeAlert);

    set({
      nextTicketNum: state.nextTicketNum + 1,
      queue,
      activeAlert: alert,
    });
    persistAndBroadcast(get());
    return queue.find((q) => q.id === newTicket.id) ?? newTicket;
  },

  advanceClock: (mins) => {
    const state = get();
    const nextChairs = state.chairs.map((c) => ({
      ...c,
      remainingMins: Math.max(0, c.remainingMins - mins),
    }));
    const { queue, alert } = recalculateQueueAndAlerts(nextChairs, state.queue, state.stylists, state.activeAlert);
    set({
      clockMins: state.clockMins + mins,
      chairs: nextChairs,
      queue,
      activeAlert: alert,
    });
    persistAndBroadcast(get());
  },

  checkInTicket: (ticketId) => {
    const state = get();
    const nextQueue = state.queue.map((t) =>
      t.id === ticketId ? { ...t, status: 'Checked in' as const, alertSent: true } : t
    );
    set({ queue: nextQueue });
    persistAndBroadcast(get());
  },

  skipNoShow: (ticketId) => {
    const state = get();
    const nextQueue = state.queue.map((t) =>
      t.id === ticketId ? { ...t, status: 'No-show' as const } : t
    );
    const { queue, alert } = recalculateQueueAndAlerts(state.chairs, nextQueue, state.stylists, state.activeAlert);
    set({ queue, activeAlert: alert });
    persistAndBroadcast(get());
  },

  completeChairCheckout: ({ chairId, addonProductIds, tipAmount, paymentMethod }) => {
    const state = get();
    const chair = state.chairs.find((c) => c.id === chairId);
    if (!chair || !chair.customerName) return;

    const stylist = state.stylists.find((s) => s.id === chair.stylistId);
    const addons = state.inventory.filter((item) => addonProductIds.includes(item.id));
    const addonAmount = addons.reduce((acc, a) => acc + a.retailPrice, 0);
    const totalAmount = chair.servicePrice + addonAmount + tipAmount;

    const newSale: SaleRecord = {
      id: `s-${Date.now()}`,
      timeMins: state.clockMins,
      ticketCode: chair.currentTicketId ? chair.currentTicketId.toUpperCase().replace('T-', 'SD-') : `SD-${state.nextTicketNum}`,
      customerName: chair.customerName,
      stylistName: stylist?.name ?? 'Stylist',
      serviceSummary: chair.serviceSummary ?? 'Salon Service',
      serviceAmount: chair.servicePrice,
      addonAmount,
      tipAmount,
      totalAmount,
      paymentMethod,
    };

    // Deduct inventory for retail add-ons
    const nextInventory = state.inventory.map((item) =>
      addonProductIds.includes(item.id) ? { ...item, stock: Math.max(0, item.stock - 1) } : item
    );

    // Update stylist cuts and revenue
    const nextStylists = state.stylists.map((s) =>
      s.id === chair.stylistId
        ? { ...s, cutsToday: s.cutsToday + 1, revenueToday: s.revenueToday + chair.servicePrice }
        : s
    );

    // Update or create Customer CRM record
    const existingCustomer = state.customers.find(
      (c) => c.name.toLowerCase() === chair.customerName?.toLowerCase()
    );
    const nextCustomers: CustomerProfile[] = existingCustomer
      ? state.customers.map((c) =>
          c.id === existingCustomer.id
            ? {
                ...c,
                visits: c.visits + 1,
                totalSpend: c.totalSpend + totalAmount,
                lastVisit: 'Today',
                lastService: chair.serviceSummary ?? c.lastService,
              }
            : c
        )
      : [
          {
            id: `c-${Date.now()}`,
            name: chair.customerName,
            phone: '+91 98200 11223',
            visits: 1,
            totalSpend: totalAmount,
            preferredStylistId: chair.stylistId,
            lastVisit: 'Today',
            lastService: chair.serviceSummary ?? 'Salon Service',
          },
          ...state.customers,
        ];

    // Pull next waiting ticket for this stylist into the chair
    const nextWaiting = state.queue.find(
      (t) =>
        t.stylistId === chair.stylistId &&
        (t.status === 'Checked in' || t.status === 'Leave now' || t.status === 'In queue')
    );

    const nextChairs = state.chairs.map((c) => {
      if (c.id !== chairId) return c;
      if (!nextWaiting) {
        return {
          ...c,
          currentTicketId: null,
          customerName: null,
          serviceSummary: null,
          serviceIds: [],
          totalMins: 0,
          remainingMins: 0,
          servicePrice: 0,
        };
      }
      return {
        ...c,
        currentTicketId: nextWaiting.code,
        customerName: nextWaiting.customerName,
        serviceSummary: nextWaiting.serviceSummary,
        serviceIds: nextWaiting.serviceIds,
        totalMins: nextWaiting.totalMins,
        remainingMins: nextWaiting.totalMins,
        servicePrice: nextWaiting.estimatedPrice,
      };
    });

    const queueAfterSeat = nextWaiting
      ? state.queue.filter((t) => t.id !== nextWaiting.id)
      : state.queue;

    const { queue, alert } = recalculateQueueAndAlerts(nextChairs, queueAfterSeat, nextStylists, state.activeAlert);

    set({
      chairs: nextChairs,
      queue,
      sales: [newSale, ...state.sales],
      stylists: nextStylists,
      customers: nextCustomers,
      inventory: nextInventory,
      activeAlert: alert,
    });
    persistAndBroadcast(get());
  },

  addExpense: ({ category, note, amount }) => {
    const state = get();
    const record: ExpenseRecord = {
      id: `e-${Date.now()}`,
      timeMins: state.clockMins,
      category,
      note: note.trim() || category,
      amount,
    };
    set({ expenses: [record, ...state.expenses] });
    persistAndBroadcast(get());
  },

  toggleStylistShift: (stylistId) => {
    const state = get();
    set({
      stylists: state.stylists.map((s) =>
        s.id === stylistId ? { ...s, status: s.status === 'Active' ? 'Break' : 'Active' } : s
      ),
    });
    persistAndBroadcast(get());
  },

  restockItem: (itemId, qty) => {
    const state = get();
    set({
      inventory: state.inventory.map((i) => (i.id === itemId ? { ...i, stock: i.stock + qty } : i)),
    });
    persistAndBroadcast(get());
  },

  resetDemo: () => {
    const fresh = getDefaultSlice();
    set({ ...fresh });
    persistAndBroadcast(get());
  },

  hydrateFromSync: (slice) => set({ ...slice }),
}));

if (broadcast) {
  broadcast.onmessage = (event: MessageEvent<{ sender: string; slice: PersistedSlice }>) => {
    if (event.data?.sender && event.data.sender !== TAB_ID && event.data.slice) {
      useSalonStore.getState().hydrateFromSync(event.data.slice);
    }
  };
}
