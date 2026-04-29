import React, { useState } from 'react';
import { Search, X, RotateCcw, Receipt } from 'lucide-react';
import { usePOS, php, Receipt as IReceipt, formatDateLabel } from '../../context/POSContext';

export function ReceiptsScreen() {
  const { receipts, selectedReceipt, setSelectedReceipt, openRefundModal, can } = usePOS();
  const [search, setSearch] = useState('');

  const filtered = receipts.filter(r =>
    r.id.toLowerCase().includes(search.toLowerCase()) ||
    r.items.some(i => i.name.toLowerCase().includes(search.toLowerCase()))
  );

  const groups: Record<string, IReceipt[]> = {};
  filtered.forEach(r => {
    const label = formatDateLabel(r.date);
    if (!groups[label]) groups[label] = [];
    groups[label].push(r);
  });

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: "'Inter', sans-serif" }}>
      {/* LEFT: List */}
      <div style={{ width: 320, flexShrink: 0, background: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search receipts…"
              style={{ width: '100%', padding: '9px 12px 9px 32px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#f8fafc', boxSizing: 'border-box', color: '#1e293b' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.background = 'white'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
            />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {Object.keys(groups).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
              <Receipt size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <div style={{ fontSize: 14, fontWeight: 600 }}>No receipts found</div>
            </div>
          ) : Object.entries(groups).map(([date, recs]) => (
            <div key={date}>
              <div style={{ padding: '7px 14px', background: '#f8fafc', fontSize: 10.5, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid #f1f5f9' }}>
                {date}
              </div>
              {recs.map(r => (
                <button key={r.id} onClick={() => setSelectedReceipt(r)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
                    borderBottom: '1px solid #f8fafc', cursor: 'pointer',
                    background: selectedReceipt?.id === r.id ? '#f5f3ff' : 'white',
                    border: 'none', textAlign: 'left', fontFamily: 'inherit', transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { if (selectedReceipt?.id !== r.id) e.currentTarget.style.background = '#f8fafc'; }}
                  onMouseLeave={e => { if (selectedReceipt?.id !== r.id) e.currentTarget.style.background = 'white'; }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 9, flexShrink: 0,
                    background: r.refundOf ? '#fff7ed' : r.refunded ? '#fee2e2' : '#f0fdf4',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1.5px solid ${r.refundOf ? '#fed7aa' : r.refunded ? '#fecaca' : '#bbf7d0'}`,
                  }}>
                    <span style={{ fontSize: 16 }}>{r.refundOf ? '↩' : r.refunded ? '⚠' : '💵'}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', fontFamily: "'JetBrains Mono', monospace" }}>{php(r.total)}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{r.time} · {r.payment}</div>
                    {r.refundOf && <div style={{ fontSize: 10.5, color: '#f97316', fontWeight: 700, marginTop: 1 }}>Refund of {r.refundOf}</div>}
                    {r.refunded && <div style={{ fontSize: 10.5, color: '#ef4444', fontWeight: 700, marginTop: 1 }}>Refunded</div>}
                  </div>
                  <div style={{ fontSize: 10.5, color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>{r.id}</div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Detail */}
      <div style={{ flex: 1, background: '#f1f5f9', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!selectedReceipt ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#94a3b8' }}>
            <Receipt size={60} style={{ opacity: 0.2 }} />
            <div style={{ fontSize: 16, fontWeight: 600 }}>Select a receipt to view details</div>
            <div style={{ fontSize: 13 }}>Click any receipt from the list on the left</div>
          </div>
        ) : (
          <ReceiptDetail receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} onRefund={() => openRefundModal(selectedReceipt)} canRefund={can('refund')} />
        )}
      </div>
    </div>
  );
}

function ReceiptDetail({ receipt, onClose, onRefund, canRefund }: {
  receipt: IReceipt; onClose: () => void; onRefund: () => void; canRefund: boolean;
}) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', margin: 16, background: 'white', borderRadius: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', padding: '14px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ color: 'white', fontSize: 16, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>{receipt.id}</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 2 }}>{receipt.pos}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {canRefund && !receipt.refunded && !receipt.refundOf && (
            <button onClick={onRefund}
              style={{
                padding: '7px 16px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.35)',
                borderRadius: 8, color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >
              <RotateCcw size={13} /> REFUND
            </button>
          )}
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {/* Amount */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#7c3aed', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{php(receipt.total)}</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Transaction Total</div>
        </div>

        {/* Meta */}
        <div style={{ background: '#f8fafc', borderRadius: 10, padding: 14, marginBottom: 16 }}>
          {[
            ['Date', `${receipt.date}`],
            ['Time', receipt.time],
            ['Payment', receipt.payment],
            ['POS Terminal', receipt.pos],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
              <span style={{ color: '#64748b' }}>{k}</span>
              <span style={{ fontWeight: 600, color: '#1e293b' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Items */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', marginBottom: 8 }}>Items</div>
          {receipt.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #f8fafc' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{item.name}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.qty} × {php(item.price)}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: '#1e293b' }}>{php(item.price * item.qty)}</div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '2px solid #e2e8f0' }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#1e293b' }}>Total</span>
          <span style={{ fontSize: 18, fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", color: '#7c3aed' }}>{php(receipt.total)}</span>
        </div>

        {/* Status banners */}
        {receipt.refunded && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: '#fee2e2', borderRadius: 8, color: '#dc2626', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            ⚠ This receipt has been refunded
          </div>
        )}
        {receipt.refundOf && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: '#fff7ed', borderRadius: 8, color: '#ea580c', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            ↩ Refund for {receipt.refundOf}
          </div>
        )}
      </div>
    </div>
  );
}
