import React, { useState, useMemo } from 'react';
import { Search, DollarSign, Receipt, RotateCcw, Package, TrendingUp } from 'lucide-react';
import { usePOS, php, formatDateLabel } from '../../context/POSContext';

type FilterType = 'all' | 'sale' | 'refund' | 'stock';

export function HistoryScreen() {
  const { receipts, invHistory } = usePOS();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const salesReceipts = receipts.filter(r => !r.refundOf);
  const refundReceipts = receipts.filter(r => !!r.refundOf);
  const totalSales = salesReceipts.reduce((s, r) => s + r.total, 0);

  // Unified timeline entries
  const allEntries = useMemo(() => {
    const saleEntries = receipts.map(r => ({
      type: r.refundOf ? 'refund' : 'sale',
      date: r.date,
      time: r.time,
      title: r.refundOf ? `Refund processed` : `Sale completed`,
      sub: r.items.map(i => `${i.name} ×${i.qty}`).join(', '),
      amount: r.refundOf ? undefined : r.total,
      id: r.id,
      payment: r.payment,
      refundOf: r.refundOf,
    }));
    const stockEntries = invHistory.map(h => ({
      type: 'stock',
      date: h.date,
      time: h.time,
      title: h.desc,
      sub: '',
      amount: undefined,
      id: '',
      payment: '',
      refundOf: undefined,
    }));
    return [...saleEntries, ...stockEntries].sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.time.localeCompare(a.time);
    });
  }, [receipts, invHistory]);

  const filtered = allEntries.filter(e => {
    const matchFilter = filter === 'all' || e.type === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || e.title.toLowerCase().includes(q) || e.id.toLowerCase().includes(q) || e.sub.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  // Group by date
  const groups: Record<string, typeof filtered> = {};
  filtered.forEach(e => {
    const label = formatDateLabel(e.date);
    if (!groups[label]) groups[label] = [];
    groups[label].push(e);
  });

  const TYPE_CONFIG = {
    sale: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: '💰' },
    refund: { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', icon: '↩️' },
    stock: { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: '📦' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f1f5f9', fontFamily: "'Inter', sans-serif" }}>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: 10, padding: '12px 14px 10px', flexShrink: 0 }}>
        {[
          { label: 'Total Sales', value: php(totalSales), icon: <DollarSign size={18} />, color: '#16a34a' },
          { label: 'Transactions', value: salesReceipts.length, icon: <Receipt size={18} />, color: '#7c3aed' },
          { label: 'Refunds', value: refundReceipts.length, icon: <RotateCcw size={18} />, color: '#ea580c' },
          { label: 'Stock Changes', value: invHistory.length, icon: <Package size={18} />, color: '#2563eb' },
        ].map(card => (
          <div key={card.label} style={{
            flex: 1, background: 'white', borderRadius: 12, padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: `1.5px solid ${card.color}22`,
          }}>
            <div style={{ color: card.color }}>{card.icon}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: card.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{card.value}</div>
              <div style={{ fontSize: 10.5, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ padding: '0 14px 10px', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search history…"
            style={{ width: '100%', padding: '9px 12px 9px 32px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 12.5, fontFamily: 'inherit', outline: 'none', background: 'white', boxSizing: 'border-box', color: '#1e293b' }}
            onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
            onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
          />
        </div>
        {(['all', 'sale', 'refund', 'stock'] as FilterType[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: '7px 14px', borderRadius: 8, border: `1.5px solid ${filter === f ? '#7c3aed' : '#e2e8f0'}`,
              background: filter === f ? '#7c3aed' : 'white',
              color: filter === f ? 'white' : '#64748b',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
              transition: 'all 0.14s',
            }}
          >
            {f === 'all' ? 'All' : f === 'sale' ? '💰 Sales' : f === 'refund' ? '↩ Refunds' : '📦 Stock'}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 14px' }}>
        {Object.keys(groups).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
            <TrendingUp size={48} style={{ margin: '0 auto 14px', opacity: 0.25 }} />
            <div style={{ fontSize: 15, fontWeight: 600 }}>No history found</div>
          </div>
        ) : Object.entries(groups).map(([date, items]) => (
          <div key={date} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{date}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {items.map((e, i) => {
                const cfg = TYPE_CONFIG[e.type as keyof typeof TYPE_CONFIG];
                return (
                  <div key={i} style={{
                    background: 'white', borderRadius: 10, padding: '11px 14px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: `1px solid ${cfg.border}`,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                      background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, border: `1px solid ${cfg.border}`,
                    }}>{cfg.icon}</div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{e.title}</div>
                      {e.sub && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.sub}</div>}
                      {e.refundOf && <div style={{ fontSize: 11, color: '#ea580c', marginTop: 1 }}>Refund of {e.refundOf}</div>}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {e.amount !== undefined && (
                        <div style={{ fontSize: 14, fontWeight: 800, color: cfg.color, fontFamily: "'JetBrains Mono', monospace" }}>{php(e.amount)}</div>
                      )}
                      {e.id && <div style={{ fontSize: 10.5, color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace", marginTop: 1 }}>{e.id}</div>}
                      <div style={{ fontSize: 10.5, color: '#cbd5e1', marginTop: 1 }}>{e.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
