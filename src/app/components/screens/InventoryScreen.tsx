import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search, Plus, SlidersHorizontal, Edit2, Boxes, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { usePOS, invStatus, InventoryItem } from '../../context/POSContext';

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  'In Stock':     { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'Low Stock':    { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
  'Need Restock': { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  'Out of Stock': { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
};

/* ── swipe carousel styles (injected once) ── */
const swipeStyleId = 'inv-swipe-styles';
if (typeof document !== 'undefined' && !document.getElementById(swipeStyleId)) {
  const style = document.createElement('style');
  style.id = swipeStyleId;
  style.textContent = `
    @media (max-width: 480px) and (orientation: portrait) {
      .inv-summary-row { overflow: hidden !important; padding: 12px 0 6px !important; gap: 0 !important; }
      .inv-summary-track { display: flex; transition: transform 0.32s cubic-bezier(.4,0,.2,1); will-change: transform; }
      .inv-summary-track > .inv-summary-card { min-width: 100%; box-sizing: border-box; flex-shrink: 0; margin: 0; padding: 16px 18px !important; }
      .inv-summary-dots { display: flex !important; }
    }
    @media (min-width: 481px), (orientation: landscape) {
      .inv-summary-track { display: flex; gap: 10px; }
      .inv-summary-track > .inv-summary-card { flex: 1; }
      .inv-summary-dots { display: none !important; }
    }
  `;
  document.head.appendChild(style);
}

export function InventoryScreen() {
  const { inventory, invHistory, openInvModal, openAdjustModal, can } = usePOS();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [historyOpen, setHistoryOpen] = useState(true);

  /* ── swipe state ── */
  const [activeCard, setActiveCard] = useState(0);
  const touchRef = useRef<{ startX: number; startY: number; startTime: number; moved: boolean } | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const filtered = inventory.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    const status = invStatus(item.qty, item.min);
    const matchStatus = statusFilter === 'all' || status === statusFilter;
    return matchSearch && matchStatus;
  });

  const summaryData = [
    { label: 'Total', value: inventory.length, color: '#64748b', icon: <Boxes size={18} /> },
    { label: 'In Stock', value: inventory.filter(i => invStatus(i.qty, i.min) === 'In Stock').length, color: '#16a34a', icon: <CheckCircle size={18} /> },
    { label: 'Low Stock', value: inventory.filter(i => invStatus(i.qty, i.min) === 'Low Stock').length, color: '#ea580c', icon: <AlertTriangle size={18} /> },
    { label: 'Restock', value: inventory.filter(i => invStatus(i.qty, i.min) === 'Need Restock').length, color: '#2563eb', icon: <TrendingDown size={18} /> },
    { label: 'Out of Stock', value: inventory.filter(i => invStatus(i.qty, i.min) === 'Out of Stock').length, color: '#dc2626', icon: <XCircle size={18} /> },
  ];

  const cardCount = summaryData.length;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    touchRef.current = { startX: t.clientX, startY: t.clientY, startTime: Date.now(), moved: false };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current || !trackRef.current) return;
    const dx = e.touches[0].clientX - touchRef.current.startX;
    const dy = e.touches[0].clientY - touchRef.current.startY;
    // Only swipe horizontally
    if (!touchRef.current.moved && Math.abs(dy) > Math.abs(dx)) { touchRef.current = null; return; }
    touchRef.current.moved = true;
    e.preventDefault();
    const base = -(activeCard * 100);
    const pct = (dx / trackRef.current.offsetWidth) * 100;
    trackRef.current.style.transition = 'none';
    trackRef.current.style.transform = `translateX(${base + pct}%)`;
  }, [activeCard]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current || !trackRef.current) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.startX;
    const dt = Date.now() - touchRef.current.startTime;
    const w = trackRef.current.offsetWidth;
    const velocity = Math.abs(dx) / dt; // px/ms
    const threshold = velocity > 0.3 ? 20 : w * 0.25; // fast flick = low threshold
    let next = activeCard;
    if (dx < -threshold && activeCard < cardCount - 1) next = activeCard + 1;
    else if (dx > threshold && activeCard > 0) next = activeCard - 1;
    trackRef.current.style.transition = 'transform 0.32s cubic-bezier(.4,0,.2,1)';
    trackRef.current.style.transform = `translateX(${-(next * 100)}%)`;
    setActiveCard(next);
    touchRef.current = null;
  }, [activeCard, cardCount]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f1f5f9', fontFamily: "'Inter', sans-serif" }}>

      {/* Summary Cards – swipeable on mobile portrait */}
      <div className="inv-summary-row" style={{ display: 'flex', gap: 10, padding: '12px 14px 10px', flexShrink: 0 }}>
        <div
          className="inv-summary-track"
          ref={trackRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ transform: `translateX(${-(activeCard * 100)}%)` }}
        >
          {summaryData.map(d => (
            <div key={d.label} className="inv-summary-card" style={{
              flex: 1, background: 'white', borderRadius: 12, padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: `1.5px solid ${d.color}25`,
            }}>
              <div style={{ color: d.color }}>{d.icon}</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: d.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{d.value}</div>
                <div style={{ fontSize: 10.5, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>{d.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Dot indicators (visible only on mobile portrait) */}
      <div className="inv-summary-dots" style={{ display: 'none', justifyContent: 'center', gap: 7, padding: '0 14px 8px' }}>
        {summaryData.map((d, i) => (
          <button key={i} onClick={() => {
            setActiveCard(i);
            if (trackRef.current) {
              trackRef.current.style.transition = 'transform 0.32s cubic-bezier(.4,0,.2,1)';
              trackRef.current.style.transform = `translateX(${-(i * 100)}%)`;
            }
          }}
            style={{
              width: i === activeCard ? 18 : 7, height: 7, borderRadius: 10, border: 'none', padding: 0,
              background: i === activeCard ? d.color : '#cbd5e1', cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
            aria-label={`Go to ${d.label}`}
          />
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ padding: '0 14px 10px', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, ID, or category…"
            style={{ width: '100%', padding: '9px 12px 9px 32px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 12.5, fontFamily: 'inherit', outline: 'none', background: 'white', boxSizing: 'border-box', color: '#1e293b' }}
            onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
            onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', 'In Stock', 'Low Stock', 'Need Restock', 'Out of Stock'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{
                padding: '6px 12px', borderRadius: 7, border: `1.5px solid ${statusFilter === s ? '#7c3aed' : '#e2e8f0'}`,
                background: statusFilter === s ? '#7c3aed' : 'white',
                color: statusFilter === s ? 'white' : '#64748b',
                fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                transition: 'all 0.14s',
              }}
            >{s === 'all' ? 'All' : s}</button>
          ))}
        </div>
        {can('editInventory') && (
          <button onClick={() => openInvModal()}
            style={{
              padding: '8px 14px', background: '#7c3aed', border: 'none', borderRadius: 9, color: 'white',
              fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 5, transition: 'background 0.15s',
              boxShadow: '0 2px 10px rgba(124,58,237,0.3)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
            onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
          ><Plus size={14} /> Add Item</button>
        )}
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: 'auto', background: 'white', margin: '0 14px', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 2 }}>
            <tr>
              {['ID', 'Product Name', 'Category', 'Qty', 'Min', 'Status', 'Actions'].map((h, i) => (
                <th key={h} style={{
                  padding: '10px 14px', textAlign: i >= 3 && i <= 4 ? 'center' : 'left',
                  fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8,
                  color: '#64748b', borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const status = invStatus(item.qty, item.min);
              const style = STATUS_STYLES[status];
              return (
                <tr key={item.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafbff'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '10px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#94a3b8' }}>{item.id}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 700, color: '#1e293b' }}>{item.name}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ display: 'inline-block', padding: '2px 9px', background: '#f3e8ff', color: '#7e22ce', borderRadius: 10, fontSize: 11.5, fontWeight: 700 }}>{item.category}</span>
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 900, color: status === 'Out of Stock' ? '#dc2626' : status === 'Low Stock' ? '#ea580c' : '#1e293b' }}>
                    {item.qty}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#94a3b8' }}>{item.min}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', background: style.bg, color: style.color, border: `1px solid ${style.border}`, borderRadius: 12, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {can('editInventory') && (
                        <>
                          <button onClick={() => openAdjustModal(item)}
                            style={{ padding: '5px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 7, color: '#16a34a', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s', whiteSpace: 'nowrap' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#dcfce7'}
                            onMouseLeave={e => e.currentTarget.style.background = '#f0fdf4'}
                          >± Adjust</button>
                          <button onClick={() => openInvModal(item)}
                            style={{ padding: '5px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 7, color: '#64748b', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s', display: 'flex', alignItems: 'center', gap: 3 }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#f5f3ff'; e.currentTarget.style.color = '#7c3aed'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#64748b'; }}
                          ><Edit2 size={10} /> Edit</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8' }}>
            <Boxes size={36} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
            <div style={{ fontWeight: 600 }}>No items found</div>
          </div>
        )}
      </div>

      {/* Stock History */}
      <div style={{ margin: '10px 14px 12px', background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', flexShrink: 0 }}>
        <button onClick={() => setHistoryOpen(!historyOpen)}
          style={{
            width: '100%', padding: '10px 14px', background: '#1e293b', borderRadius: historyOpen ? '12px 12px 0 0' : 12,
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            color: '#e2e8f0', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
          }}
        >
          <span>📜 Stock History ({invHistory.length})</span>
          {historyOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {historyOpen && (
          <div style={{ maxHeight: 130, overflowY: 'auto' }}>
            {invHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: 12 }}>No stock history yet.</div>
            ) : invHistory.map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: i < invHistory.length - 1 ? '1px solid #f8fafc' : 'none', fontSize: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: h.type === 'add' ? '#16a34a' : h.type === 'sub' ? '#dc2626' : '#2563eb' }} />
                <span style={{ flex: 1, color: '#1e293b' }}>{h.desc}</span>
                <span style={{ color: '#94a3b8', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>{h.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
