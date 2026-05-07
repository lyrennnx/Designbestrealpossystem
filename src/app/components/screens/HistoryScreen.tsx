import React, { useState, useMemo } from 'react';
import { Search, DollarSign, Receipt as ReceiptIcon, RotateCcw, Package, TrendingUp, Printer, Trash2 } from 'lucide-react';
import { usePOS, php, formatDateLabel } from '../../context/POSContext';
import { printSalesReport } from '../shared/PrintUtils';

type FilterType = 'all' | 'sale' | 'refund' | 'stock';

export function HistoryScreen() {
  const { receipts, invHistory, clearHistory, currentUser } = usePOS();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const salesReceipts = receipts.filter(r => !r.refundOf);
  const refundReceipts = receipts.filter(r => !!r.refundOf);
  const totalSales = salesReceipts.reduce((s, r) => s + r.total, 0);
  const refundTotal = refundReceipts.reduce((s, r) => s + r.total, 0);
  const netSales = totalSales - refundTotal;

  const handlePrintReport = () => {
    printSalesReport({
      totalSales,
      transactionCount: salesReceipts.length,
      refundCount: refundReceipts.length,
      refundTotal,
      netSales,
      receipts,
    });
  };

  const handleClear = () => {
    if (confirm('Clear all history? This will remove every receipt and stock movement and cannot be undone.')) {
      clearHistory();
    }
  };

  const rows = useMemo(() => {
    const items: { kind: 'sale' | 'refund' | 'stock'; date: string; time: string; label: string; amount?: number }[] = [];
    salesReceipts.forEach(r => items.push({ kind: 'sale', date: r.date, time: r.time, label: `Sale ${r.id} · ${r.items.length} item(s)`, amount: r.total }));
    refundReceipts.forEach(r => items.push({ kind: 'refund', date: r.date, time: r.time, label: `Refund ${r.id} (of ${r.refundOf})`, amount: r.total }));
    invHistory.forEach(h => items.push({ kind: 'stock', date: h.date, time: h.time, label: h.desc }));
    const filtered = items.filter(it => {
      if (filter !== 'all' && it.kind !== filter) return false;
      if (search && !it.label.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    filtered.sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));
    return filtered;
  }, [salesReceipts, refundReceipts, invHistory, filter, search]);

  const stat = (icon: React.ReactNode, label: string, value: string, color: string) => (
    <div style={{ flex: 1, minWidth: 160, background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '15', color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{value}</div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: 20, height: '100%', overflow: 'auto', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        {stat(<DollarSign size={20} />, 'Total Sales', php(totalSales), '#10b981')}
        {stat(<ReceiptIcon size={20} />, 'Transactions', String(salesReceipts.length), '#3b82f6')}
        {stat(<RotateCcw size={20} />, 'Refunds', `${refundReceipts.length} · ${php(refundTotal)}`, '#f97316')}
        {stat(<TrendingUp size={20} />, 'Net Sales', php(netSales), '#7c3aed')}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search history…"
            style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
        </div>
        {(['all', 'sale', 'refund', 'stock'] as FilterType[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: '8px 14px', borderRadius: 8, border: '1px solid ' + (filter === f ? '#7c3aed' : '#e2e8f0'),
              background: filter === f ? '#7c3aed' : 'white', color: filter === f ? 'white' : '#475569',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'inherit',
            }}>{f}</button>
        ))}
        <button onClick={handlePrintReport}
          style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
          <Printer size={14} /> Print Report
        </button>
        {currentUser?.role === 'owner' && (
          <button onClick={handleClear}
            style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
            <Trash2 size={14} /> Clear History
          </button>
        )}
      </div>

      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
        {rows.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
            <Package size={32} style={{ opacity: 0.3, marginBottom: 8 }} /><br />
            No history to show.
          </div>
        ) : (
          rows.map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < rows.length - 1 ? '1px solid #f1f5f9' : 'none', fontSize: 13 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: it.kind === 'sale' ? '#dcfce7' : it.kind === 'refund' ? '#ffedd5' : '#e0e7ff',
                color: it.kind === 'sale' ? '#15803d' : it.kind === 'refund' ? '#c2410c' : '#4338ca',
              }}>
                {it.kind === 'sale' ? <DollarSign size={14} /> : it.kind === 'refund' ? <RotateCcw size={14} /> : <Package size={14} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.label}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{formatDateLabel(it.date)} · {it.time}</div>
              </div>
              {it.amount !== undefined && (
                <div style={{ fontWeight: 700, color: it.kind === 'refund' ? '#c2410c' : '#0f172a' }}>
                  {it.kind === 'refund' ? '−' : ''}{php(it.amount)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
