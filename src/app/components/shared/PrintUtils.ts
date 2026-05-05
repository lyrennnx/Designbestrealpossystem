import { Receipt, php } from '../../context/POSContext';

export function printReceipt(receipt: Receipt) {
  const isRefund = !!receipt.refundOf;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Receipt ${receipt.id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', Courier, monospace;
      width: 300px;
      margin: 0 auto;
      padding: 16px;
      font-size: 12px;
      color: #000;
    }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .divider { border-top: 1px dashed #000; margin: 8px 0; }
    .divider-solid { border-top: 2px solid #000; margin: 8px 0; }
    .row { display: flex; justify-content: space-between; padding: 2px 0; }
    .store-name { font-size: 18px; font-weight: bold; letter-spacing: 1px; margin-bottom: 2px; }
    .receipt-id { font-size: 13px; font-weight: bold; margin: 4px 0; }
    .total-amount { font-size: 22px; font-weight: bold; margin: 6px 0; }
    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border: 1.5px solid #000;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      margin: 4px 0;
    }
    .footer { font-size: 10px; color: #555; margin-top: 6px; }
    @media print {
      body { width: 100%; }
    }
  </style>
</head>
<body>
  <div class="center">
    <div class="store-name">FRAGRANCE POS</div>
    <div style="font-size:10px; color:#555;">Point of Sale System</div>
    <div class="divider"></div>
    <div class="receipt-id">${receipt.id}</div>
    ${isRefund ? `<div class="status-badge">↩ REFUND RECEIPT</div>` : ''}
    ${receipt.refunded ? `<div class="status-badge">⚠ REFUNDED</div>` : ''}
    <div class="total-amount">${php(receipt.total)}</div>
  </div>

  <div class="divider"></div>

  <div class="row"><span>Date</span><span>${receipt.date}</span></div>
  <div class="row"><span>Time</span><span>${receipt.time}</span></div>
  <div class="row"><span>Payment</span><span>${receipt.payment}</span></div>
  <div class="row"><span>Terminal</span><span>${receipt.pos}</span></div>
  ${isRefund ? `<div class="row"><span>Refund of</span><span>${receipt.refundOf}</span></div>` : ''}

  <div class="divider"></div>
  <div class="bold" style="margin-bottom:4px;">ITEMS</div>
  ${receipt.items.map(item => `
    <div class="row">
      <span style="flex:1; margin-right:8px;">${item.name}</span>
      <span>${item.qty} × ${php(item.price)}</span>
    </div>
    <div class="row" style="padding-left:8px; color:#555;">
      <span></span>
      <span>${php(item.price * item.qty)}</span>
    </div>
  `).join('')}

  <div class="divider-solid"></div>
  <div class="row bold" style="font-size:14px;">
    <span>TOTAL</span>
    <span>${php(receipt.total)}</span>
  </div>

  <div class="divider"></div>
  <div class="center footer">
    <div>Thank you for your purchase!</div>
    <div style="margin-top:4px;">Printed: ${new Date().toLocaleString()}</div>
  </div>
</body>
</html>`;

  printViaIframe(html, `Receipt ${receipt.id}`);
}

function printViaIframe(html: string, title: string) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) { document.body.removeChild(iframe); return; }
  doc.open();
  doc.write(html);
  doc.close();

  const cleanup = () => {
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 500);
  };

  const trigger = () => {
    try {
      const w = iframe.contentWindow;
      if (!w) { cleanup(); return; }
      // Update parent title so the print header uses the receipt title
      // instead of "about:blank".
      const prevTitle = document.title;
      document.title = title;
      w.focus();
      w.print();
      document.title = prevTitle;
    } catch (err) {
      console.log(`Error printing via iframe: ${err}`);
    }
    cleanup();
  };

  // Wait for iframe content to be ready before printing.
  if (iframe.contentWindow?.document.readyState === 'complete') {
    setTimeout(trigger, 200);
  } else {
    iframe.onload = () => setTimeout(trigger, 200);
  }
}

export interface SalesReportData {
  totalSales: number;
  transactionCount: number;
  refundCount: number;
  refundTotal: number;
  netSales: number;
  receipts: Receipt[];
  dateRange?: string;
}

export function printSalesReport(data: SalesReportData) {
  const now = new Date().toLocaleString();
  const salesReceipts = data.receipts.filter(r => !r.refundOf);
  const refundReceipts = data.receipts.filter(r => !!r.refundOf);

  // Group by date
  const byDate: Record<string, Receipt[]> = {};
  salesReceipts.forEach(r => {
    if (!byDate[r.date]) byDate[r.date] = [];
    byDate[r.date].push(r);
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Sales Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      padding: 32px;
      color: #1e293b;
      font-size: 12px;
    }
    h1 { font-size: 22px; color: #1e293b; margin-bottom: 2px; }
    h2 { font-size: 14px; color: #475569; margin: 18px 0 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; }
    h3 { font-size: 12px; color: #7c3aed; margin: 12px 0 6px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .badge { background: #7c3aed; color: white; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: bold; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
    .summary-card { background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .summary-card .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 4px; }
    .summary-card .value { font-size: 20px; font-weight: bold; }
    .summary-card.green .value { color: #16a34a; }
    .summary-card.purple .value { color: #7c3aed; }
    .summary-card.red .value { color: #dc2626; }
    .summary-card.blue .value { color: #2563eb; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11.5px; }
    th { background: #f1f5f9; padding: 7px 10px; text-align: left; font-weight: 700; color: #475569; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1.5px solid #e2e8f0; }
    td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; }
    tr:last-child td { border-bottom: none; }
    .mono { font-family: 'Courier New', monospace; }
    .text-right { text-align: right; }
    .text-green { color: #16a34a; font-weight: bold; }
    .text-red { color: #dc2626; font-weight: bold; }
    .text-purple { color: #7c3aed; font-weight: bold; }
    .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 10px; text-align: center; }
    .net-row { background: #f0fdf4; font-weight: bold; }
    .refund-row { background: #fff7ed; }
    @media print {
      body { padding: 16px; }
      .summary-grid { grid-template-columns: repeat(3, 1fr); }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Sales Report</h1>
      <div style="color:#94a3b8; font-size:11px; margin-top:2px;">FRAGRANCE POS · ${data.dateRange || 'All Time'}</div>
    </div>
    <div>
      <div class="badge">FRAGRANCE POS</div>
      <div style="color:#94a3b8; font-size:10px; margin-top:6px; text-align:right;">Printed: ${now}</div>
    </div>
  </div>

  <div class="summary-grid">
    <div class="summary-card green">
      <div class="label">Total Sales</div>
      <div class="value">${php(data.totalSales)}</div>
    </div>
    <div class="summary-card blue">
      <div class="label">Net Sales</div>
      <div class="value">${php(data.netSales)}</div>
    </div>
    <div class="summary-card red">
      <div class="label">Total Refunds</div>
      <div class="value">${php(data.refundTotal)}</div>
    </div>
    <div class="summary-card purple">
      <div class="label">Transactions</div>
      <div class="value">${data.transactionCount}</div>
    </div>
    <div class="summary-card red">
      <div class="label">Refund Count</div>
      <div class="value">${data.refundCount}</div>
    </div>
    <div class="summary-card">
      <div class="label">Avg Transaction</div>
      <div class="value" style="color:#1e293b;">${data.transactionCount > 0 ? php(data.totalSales / data.transactionCount) : php(0)}</div>
    </div>
  </div>

  <h2>Transaction Breakdown</h2>
  <table>
    <thead>
      <tr>
        <th>Receipt ID</th>
        <th>Date</th>
        <th>Time</th>
        <th>Items</th>
        <th>Payment</th>
        <th>Terminal</th>
        <th class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${salesReceipts.map(r => `
        <tr class="${r.refunded ? 'refund-row' : ''}">
          <td class="mono text-purple">${r.id}</td>
          <td>${r.date}</td>
          <td>${r.time}</td>
          <td>${r.items.map(i => `${i.name.replace(/^\[R\] /, '')} ×${i.qty}`).join(', ')}</td>
          <td>${r.payment}</td>
          <td>${r.pos}</td>
          <td class="text-right mono ${r.refunded ? 'text-red' : 'text-green'}">${php(r.total)}${r.refunded ? ' ↩' : ''}</td>
        </tr>
      `).join('')}
      <tr class="net-row">
        <td colspan="6" style="text-align:right; padding-right:12px;">TOTAL SALES</td>
        <td class="text-right mono text-green">${php(data.totalSales)}</td>
      </tr>
    </tbody>
  </table>

  ${refundReceipts.length > 0 ? `
  <h2>Refunds</h2>
  <table>
    <thead>
      <tr>
        <th>Refund ID</th>
        <th>Date</th>
        <th>Time</th>
        <th>Original Receipt</th>
        <th>Payment</th>
        <th class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${refundReceipts.map(r => `
        <tr>
          <td class="mono text-red">${r.id}</td>
          <td>${r.date}</td>
          <td>${r.time}</td>
          <td class="mono">${r.refundOf}</td>
          <td>${r.payment}</td>
          <td class="text-right mono text-red">-${php(r.total)}</td>
        </tr>
      `).join('')}
      <tr style="background:#fee2e2; font-weight:bold;">
        <td colspan="5" style="text-align:right; padding-right:12px;">TOTAL REFUNDS</td>
        <td class="text-right mono text-red">-${php(data.refundTotal)}</td>
      </tr>
    </tbody>
  </table>
  ` : ''}

  <h2>Net Summary</h2>
  <table>
    <tbody>
      <tr><td>Gross Sales</td><td class="text-right mono text-green">${php(data.totalSales)}</td></tr>
      <tr class="refund-row"><td>Total Refunds</td><td class="text-right mono text-red">- ${php(data.refundTotal)}</td></tr>
      <tr class="net-row"><td><strong>Net Sales</strong></td><td class="text-right mono text-purple"><strong>${php(data.netSales)}</strong></td></tr>
    </tbody>
  </table>

  <div class="footer">
    This is an automatically generated report from Fragrance POS. · Printed on ${now}
  </div>
</body>
</html>`;

  printViaIframe(html, `Sales Report — ${data.dateRange || 'All Time'}`);
}
