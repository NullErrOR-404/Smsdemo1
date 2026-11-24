import { useState } from 'react';
import { formatClock, formatINR, useSalonStore } from '../../store/useSalonStore';
import type { ExpenseCategory } from '../../types/salon';
import { AnalyticsSuite } from './AnalyticsSuite';
import { AnimatedNumber } from './AnimatedNumber';

type ErpTab = 'analytics' | 'ledger' | 'customers' | 'staff' | 'inventory';

const ERP_TABS: { id: ErpTab; label: string }[] = [
  { id: 'analytics', label: 'Analytics' },
  { id: 'ledger', label: 'Sales and Expenses' },
  { id: 'customers', label: 'Customers' },
  { id: 'staff', label: 'Staff and Commissions' },
  { id: 'inventory', label: 'Inventory' },
];

const EXPENSE_CATEGORIES: ExpenseCategory[] = ['Supplies', 'Rent', 'Utilities', 'Staff Payout', 'Maintenance'];

export function OwnerERP() {
  const sales = useSalonStore((s) => s.sales);
  const expenses = useSalonStore((s) => s.expenses);
  const customers = useSalonStore((s) => s.customers);
  const stylists = useSalonStore((s) => s.stylists);
  const inventory = useSalonStore((s) => s.inventory);
  const addExpense = useSalonStore((s) => s.addExpense);
  const toggleStylistShift = useSalonStore((s) => s.toggleStylistShift);
  const restockItem = useSalonStore((s) => s.restockItem);

  const [tab, setTab] = useState<ErpTab>('analytics');
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('Supplies');
  const [expNote, setExpNote] = useState('');
  const [expAmount, setExpAmount] = useState('650');

  const todayRevenue = 10481 + sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const todayExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = todayRevenue - todayExpenses;
  const marginPct = todayRevenue > 0 ? ((netProfit / todayRevenue) * 100).toFixed(1) : '0.0';
  const lowStockCount = inventory.filter((i) => i.stock <= i.minStock).length;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(expAmount);
    if (!numeric || numeric <= 0) return;
    addExpense({ category: expCategory, note: expNote || `${expCategory} entry`, amount: numeric });
    setExpNote('');
    setExpAmount('');
  };

  return (
    <div className="w-full space-y-14" data-lenis-prevent>
      {/* Serene Full-Width Header */}
      <div className="space-y-2">
        <h1 className="section-display">Owner ERP</h1>
        <p className="text-[14px] text-[var(--sd-muted)] max-w-[62ch]">
          Live financial ledger, chair utilization, staff commissions, and inventory synced directly from Floor Desk checkouts.
        </p>
      </div>

      {/* Full-Width 4 Open-Air KPI Numerals */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 xl:gap-12 border-t border-b border-[var(--sd-line)] py-8">
        <div>
          <p className="text-[13px] text-[var(--sd-muted)]">Gross revenue today</p>
          <p className="kpi-display mt-2 text-[var(--sd-ink)]">
            <AnimatedNumber value={todayRevenue} prefix="₹" />
          </p>
          <p className="text-[12px] text-[var(--sd-brand)] mt-2.5 tabular">+18.4% vs last Tuesday</p>
        </div>

        <div>
          <p className="text-[13px] text-[var(--sd-muted)]">Operating expenses</p>
          <p className="kpi-display mt-2 text-[var(--sd-ink)]">
            <AnimatedNumber value={todayExpenses} prefix="₹" />
          </p>
          <p className="text-[12px] text-[var(--sd-muted)] mt-2.5">{expenses.length} ledger entries today</p>
        </div>

        <div>
          <p className="text-[13px] text-[var(--sd-muted)]">Net operating profit</p>
          <p className="kpi-display mt-2 text-[var(--sd-brand)]">
            <AnimatedNumber value={netProfit} prefix="₹" />
          </p>
          <p className="text-[12px] text-[var(--sd-muted)] mt-2.5 tabular">{marginPct}% operating margin</p>
        </div>

        <div>
          <p className="text-[13px] text-[var(--sd-muted)]">ETA accuracy (±3 min)</p>
          <p className="kpi-display mt-2 text-[var(--sd-ink)]">94.2%</p>
          <p className="text-[12px] text-[var(--sd-alert)] mt-2.5 tabular">
            {lowStockCount > 0 ? `${lowStockCount} inventory items low` : 'All stock healthy'}
          </p>
        </div>
      </div>

      {/* Underlined ERP Section Nav */}
      <div className="w-full flex flex-wrap items-center gap-6 sm:gap-10 border-b border-[var(--sd-line)] pb-4 text-[14px]">
        {ERP_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`cursor-pointer ${
              tab === t.id
                ? 'font-semibold text-[var(--sd-ink)] underline underline-offset-[18px] decoration-2'
                : 'text-[var(--sd-muted)] hover:text-[var(--sd-ink)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: ANALYTICS */}
      {tab === 'analytics' && (
        <AnalyticsSuite todayRevenue={todayRevenue} todayExpenses={todayExpenses} />
      )}

      {/* TAB 2: SALES & EXPENSES LEDGER */}
      {tab === 'ledger' && (
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16 items-start">
          <div className="lg:col-span-7 2xl:col-span-8 space-y-4 min-w-0">
            <h2 className="text-[16px] font-semibold">Recent POS checkouts</h2>
            <div className="overflow-x-auto border-t border-b border-[var(--sd-line)]">
              <table className="w-full text-left border-collapse text-[14px]">
                <thead>
                  <tr className="border-b border-[var(--sd-line)] text-[12px] text-[var(--sd-muted)]">
                    <th className="py-3.5 pr-4 font-medium">Time</th>
                    <th className="py-3.5 px-4 font-medium">Guest</th>
                    <th className="py-3.5 px-4 font-medium">Stylist</th>
                    <th className="py-3.5 px-4 font-medium">Method</th>
                    <th className="py-3.5 pl-4 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--sd-line)]">
                  {sales.map((s) => (
                    <tr key={s.id}>
                      <td className="py-4 pr-4 font-mono-code text-[12px] text-[var(--sd-muted)] tabular">
                        {formatClock(s.timeMins)}
                      </td>
                      <td className="py-4 px-4 font-medium">
                        {s.customerName}
                        <span className="block text-[12px] text-[var(--sd-muted)] font-normal">
                          {s.serviceSummary}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-[13px]">{s.stylistName}</td>
                      <td className="py-4 px-4 text-[13px] text-[var(--sd-muted)]">{s.paymentMethod}</td>
                      <td className="py-4 pl-4 text-right font-semibold tabular text-[var(--sd-brand)]">
                        {formatINR(s.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-5 2xl:col-span-4 space-y-6 min-w-0">
            <h2 className="text-[16px] font-semibold">Expenses ledger</h2>
            <form
              onSubmit={handleAddExpense}
              className="bg-[var(--sd-surface)] border border-[var(--sd-line)] p-5 space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
                  className="border border-[var(--sd-line)] px-3 py-2.5 text-[13px] bg-white"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  placeholder="Amount (₹)"
                  className="border border-[var(--sd-line)] px-3 py-2.5 text-[13px] tabular"
                />
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={expNote}
                  onChange={(e) => setExpNote(e.target.value)}
                  placeholder="Description (e.g. Towel laundry, blades)"
                  className="flex-1 border border-[var(--sd-line)] px-3 py-2.5 text-[13px]"
                />
                <button
                  type="submit"
                  className="bg-[var(--sd-ink)] text-white px-5 py-2.5 text-[13px] font-medium cursor-pointer"
                >
                  Log
                </button>
              </div>
            </form>

            <div className="border-t border-b border-[var(--sd-line)] divide-y divide-[var(--sd-line)] text-[14px]">
              {expenses.map((ex) => (
                <div key={ex.id} className="py-4 flex items-baseline justify-between gap-4">
                  <div>
                    <p className="font-medium">{ex.category}</p>
                    <p className="text-[12px] text-[var(--sd-muted)] mt-0.5">{ex.note}</p>
                  </div>
                  <span className="font-semibold tabular shrink-0">{formatINR(ex.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMERS CRM */}
      {tab === 'customers' && (
        <div className="w-full overflow-x-auto border-t border-b border-[var(--sd-line)]">
          <table className="w-full text-left border-collapse text-[14px]">
            <thead>
              <tr className="border-b border-[var(--sd-line)] text-[12px] text-[var(--sd-muted)]">
                <th className="py-4 pr-4 font-medium">Customer</th>
                <th className="py-4 px-4 font-medium">Phone</th>
                <th className="py-4 px-4 font-medium">Preferred stylist</th>
                <th className="py-4 px-4 font-medium">Last service</th>
                <th className="py-4 px-4 font-medium text-right">Visits</th>
                <th className="py-4 pl-4 font-medium text-right">Lifetime spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--sd-line)]">
              {customers.map((c) => {
                const st = stylists.find((s) => s.id === c.preferredStylistId);
                return (
                  <tr key={c.id}>
                    <td className="py-4.5 pr-4 font-medium">{c.name}</td>
                    <td className="py-4.5 px-4 font-mono-code text-[12px] text-[var(--sd-muted)] tabular">{c.phone}</td>
                    <td className="py-4.5 px-4 text-[13px]">{st?.name ?? 'Any'}</td>
                    <td className="py-4.5 px-4 text-[13px] text-[var(--sd-muted)]">{c.lastService}</td>
                    <td className="py-4.5 px-4 text-right tabular">{c.visits}</td>
                    <td className="py-4.5 pl-4 text-right font-semibold tabular">{formatINR(c.totalSpend)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: STAFF & COMMISSIONS */}
      {tab === 'staff' && (
        <div className="w-full overflow-x-auto border-t border-b border-[var(--sd-line)]">
          <table className="w-full text-left border-collapse text-[14px]">
            <thead>
              <tr className="border-b border-[var(--sd-line)] text-[12px] text-[var(--sd-muted)]">
                <th className="py-4 pr-4 font-medium">Chair</th>
                <th className="py-4 px-4 font-medium">Stylist</th>
                <th className="py-4 px-4 font-medium">Specialty</th>
                <th className="py-4 px-4 font-medium text-right">Cuts today</th>
                <th className="py-4 px-4 font-medium text-right">Service revenue</th>
                <th className="py-4 px-4 font-medium text-right">Commission due</th>
                <th className="py-4 pl-4 font-medium text-right">Shift</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--sd-line)]">
              {stylists.map((st) => (
                <tr key={st.id}>
                  <td className="py-4.5 pr-4 font-mono-code text-[13px]">Chair {st.chairNumber}</td>
                  <td className="py-4.5 px-4 font-medium">{st.name}</td>
                  <td className="py-4.5 px-4 text-[13px] text-[var(--sd-muted)]">{st.specialty}</td>
                  <td className="py-4.5 px-4 text-right tabular">{st.cutsToday}</td>
                  <td className="py-4.5 px-4 text-right tabular">{formatINR(st.revenueToday)}</td>
                  <td className="py-4.5 px-4 text-right font-semibold tabular text-[var(--sd-brand)]">
                    {formatINR(st.revenueToday * st.commissionRate)} ({Math.round(st.commissionRate * 100)}%)
                  </td>
                  <td className="py-4.5 pl-4 text-right text-[13px]">
                    <button
                      type="button"
                      onClick={() => toggleStylistShift(st.id)}
                      className={`underline underline-offset-4 cursor-pointer font-medium ${
                        st.status === 'Active' ? 'text-[var(--sd-brand)]' : 'text-[var(--sd-alert)]'
                      }`}
                    >
                      {st.status}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: INVENTORY */}
      {tab === 'inventory' && (
        <div className="w-full overflow-x-auto border-t border-b border-[var(--sd-line)]">
          <table className="w-full text-left border-collapse text-[14px]">
            <thead>
              <tr className="border-b border-[var(--sd-line)] text-[12px] text-[var(--sd-muted)]">
                <th className="py-4 pr-4 font-medium">SKU</th>
                <th className="py-4 px-4 font-medium">Product</th>
                <th className="py-4 px-4 font-medium">Type</th>
                <th className="py-4 px-4 font-medium text-right">Retail price</th>
                <th className="py-4 px-4 font-medium text-right">On hand</th>
                <th className="py-4 pl-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--sd-line)]">
              {inventory.map((item) => {
                const low = item.stock <= item.minStock;
                return (
                  <tr key={item.id}>
                    <td className="py-4.5 pr-4 font-mono-code text-[12px] text-[var(--sd-muted)]">{item.sku}</td>
                    <td className="py-4.5 px-4 font-medium">{item.name}</td>
                    <td className="py-4.5 px-4 text-[13px] text-[var(--sd-muted)]">{item.category}</td>
                    <td className="py-4.5 px-4 text-right tabular">{formatINR(item.retailPrice)}</td>
                    <td className={`py-4.5 px-4 text-right tabular font-semibold ${low ? 'text-[var(--sd-alert)]' : ''}`}>
                      {item.stock} {low ? '(reorder)' : ''}
                    </td>
                    <td className="py-4.5 pl-4 text-right text-[13px]">
                      <button
                        type="button"
                        onClick={() => restockItem(item.id, 5)}
                        className="underline underline-offset-4 text-[var(--sd-brand)] font-medium cursor-pointer"
                      >
                        Restock +5
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
