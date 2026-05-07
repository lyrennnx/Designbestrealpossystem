import React, { useState } from 'react';
import { Store, Info, BarChart3 } from 'lucide-react';
import { usePOS, php, formatDateLabel } from '../../context/POSContext';

export function SettingsScreen() {
  const { receipts, showToast } = usePOS();
  const [reportDate, setReportDate] = useState('');
  const [report, setReport] = useState<{ date: string; totalSales: number; txCount: number; totalItems: number; items: { name: string; qty: number; sales: number }[] } | null>(null);

  const generateReport = () => {
    if (!reportDate) { showToast('Please select a date.'); return; }
    const txns = receipts.filter(r => r.date === reportDate && !r.refundOf);
    const itemMap = new Map<string, { name: string; qty: number; sales: number }>();
    txns.forEach(r => r.items.forEach(item => {
      const e = itemMap.get(item.name) || { name: item.name, qty: 0, sales: 0 };
      e.qty += item.qty; e.sales += item.qty * item.price;
      itemMap.set(item.name, e);
    }));
    const itemArr = Array.from(itemMap.values()).sort((a, b) => b.qty - a.qty);
    setReport({
      date: reportDate,
      totalSales: txns.reduce((s, r) => s + r.total, 0),
      txCount: txns.length,
      totalItems: itemArr.reduce((s, i) => s + i.qty, 0),
      items: itemArr,
    });
    if (txns.length === 0) showToast('No sales data for selected date.');
    else showToast('Sales report generated.');
  };

  const STORE_INFO = [
    ['Store Name', 'The 1470'],
    ['POS Name', 'POS_CPET-8 LAB'],
    ['Currency', 'PHP (₱)'],
    ['Tax', 'None'],
    ['Receipt Footer', 'Thank you!'],
  ];

  const ABOUT_INFO = [
    ['Version', 'v3.07'],
    ['Edition', 'Fragrance Shop'],
    ['Platform', 'React POS'],
  ];

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#f1f5f9', padding: 16, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 1000, margin: '0 auto' }}>

        {/* Store Info */}
        <SettingsCard title="Store Information" icon={<Store size={16} />}>
          {STORE_INFO.map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid #f8fafc', fontSize: 13 }}>
              <span style={{ color: '#64748b' }}>{k}</span>
              <span style={{ fontWeight: 700, color: '#1e293b' }}>{v}</span>
            </div>
          ))}
        </SettingsCard>

        {/* About */}
        <SettingsCard title="About" icon={<Info size={16} />}>
          {ABOUT_INFO.map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid #f8fafc', fontSize: 13 }}>
              <span style={{ color: '#64748b' }}>{k}</span>
              <span style={{ fontWeight: 700, color: '#1e293b' }}>{v}</span>
            </div>
          ))}

        </SettingsCard>

        {/* Sales Report - spans full width */}
        <div style={{ gridColumn: '1 / -1' }}>
          <SettingsCard title="Sales Report" icon={<BarChart3 size={16} />}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: '#64748b', marginBottom: 5 }}>Report Date</label>
                <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 13, fontFamily: 'inherit', outline: 'none', color: '#1e293b', boxSizing: 'border-box' }}
                  onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
                  onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                />
              </div>
              <button onClick={generateReport}
                style={{
                  padding: '10px 20px', background: '#7c3aed', border: 'none', borderRadius: 9,
                  color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'background 0.15s', whiteSpace: 'nowrap',
                  boxShadow: '0 2px 10px rgba(124,58,237,0.3)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
                onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
              >Generate Report</button>
            </div>

            {/* Report results */}
            {!report ? (
              <div style={{ textAlign: 'center', padding: '30px 20px', color: '#94a3b8', background: '#f8fafc', borderRadius: 10 }}>
                <BarChart3 size={32} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                <div style={{ fontSize: 13 }}>Select a date and generate a report.</div>
              </div>
            ) : report.txCount === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 20px', color: '#94a3b8', background: '#f8fafc', borderRadius: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>No sales data for {formatDateLabel(report.date)}.</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#7c3aed', marginBottom: 12 }}>
                  Report for {formatDateLabel(report.date)}
                </div>
                {/* KPI cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                  {[
                    { label: 'Total Sales', value: php(report.totalSales), color: '#16a34a' },
                    { label: 'Transactions', value: report.txCount.toString(), color: '#7c3aed' },
                    { label: 'Items Sold', value: report.totalItems.toString(), color: '#2563eb' },
                  ].map(c => (
                    <div key={c.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: c.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{c.value}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{c.label}</div>
                    </div>
                  ))}
                </div>
                {/* Items sold */}
                <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Items Sold</div>
                {report.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: i % 2 === 0 ? '#f8fafc' : 'white', borderRadius: 8, marginBottom: 3 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{php(item.sales)} total</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#7c3aed', fontFamily: "'JetBrains Mono', monospace" }}>{item.qty} sold</div>
                  </div>
                ))}
              </div>
            )}
          </SettingsCard>
        </div>
      </div>
    </div>
  );
}

function SettingsCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#7c3aed' }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: '#1e293b' }}>{title}</span>
      </div>
      <div style={{ padding: '4px 18px 14px' }}>{children}</div>
    </div>
  );
}
