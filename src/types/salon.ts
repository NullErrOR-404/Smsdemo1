export type RoleView = 'customer' | 'desk' | 'erp';
export type BookingMode = 'live' | 'slot';
export type TicketChannel = 'Online QR' | 'Walk-in';
export type TicketStatus = 'In queue' | 'Leave now' | 'Checked in' | 'In chair' | 'Completed' | 'No-show';
export type PaymentMethod = 'UPI' | 'Cash' | 'Card';
export type StylistShiftStatus = 'Active' | 'Break';
export type ExpenseCategory = 'Supplies' | 'Rent' | 'Utilities' | 'Staff Payout' | 'Maintenance';

export interface ServiceItem {
  id: string;
  index: string;
  name: string;
  category: 'Hair' | 'Beard' | 'Color' | 'Treatment';
  durationMins: number;
  price: number;
}

export interface Stylist {
  id: string;
  name: string;
  chairNumber: string;
  specialty: string;
  status: StylistShiftStatus;
  commissionRate: number; // e.g. 0.35
  cutsToday: number;
  revenueToday: number;
}

export interface ChairState {
  id: string;
  chairNumber: string;
  stylistId: string;
  currentTicketId: string | null;
  customerName: string | null;
  serviceSummary: string | null;
  serviceIds: string[];
  totalMins: number;
  remainingMins: number;
  servicePrice: number;
}

export interface QueueTicket {
  id: string;
  code: string;
  customerName: string;
  phone: string;
  channel: TicketChannel;
  mode: BookingMode;
  scheduledSlot?: string;
  serviceIds: string[];
  serviceSummary: string;
  totalMins: number;
  estimatedPrice: number;
  stylistId: string;
  etaMins: number;
  status: TicketStatus;
  createdAtMins: number;
  alertSent: boolean;
  isCurrentUser?: boolean;
}

export interface SaleRecord {
  id: string;
  timeMins: number;
  ticketCode: string;
  customerName: string;
  stylistName: string;
  serviceSummary: string;
  serviceAmount: number;
  addonAmount: number;
  tipAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
}

export interface ExpenseRecord {
  id: string;
  timeMins: number;
  category: ExpenseCategory;
  note: string;
  amount: number;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  visits: number;
  totalSpend: number;
  preferredStylistId: string;
  lastVisit: string;
  lastService: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'Retail' | 'Consumable';
  stock: number;
  minStock: number;
  retailPrice: number;
}

export interface ActiveAlert {
  id: string;
  ticketCode: string;
  customerName: string;
  stylistName: string;
  etaMins: number;
  channelNote: string;
  message: string;
}
