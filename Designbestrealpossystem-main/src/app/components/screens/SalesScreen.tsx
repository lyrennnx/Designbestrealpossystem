import React, { useState, useMemo } from 'react';
import { Search, Minus, Plus, Trash2, CreditCard, ShoppingCart } from 'lucide-react';
import { usePOS, php, Product } from '../../context/POSContext';

const ITEMS_PER_PAGE = 20;

export function SalesScreen() {
  const { products, cart, addToCart, updateCartQty, clearCart, cartTotal, inventory, openChargeModal } = usePOS();
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState<'all' | 'male' | 'female'>('all');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (gender === 'all' || p.gender === gender)
  ), [products, search, gender]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = filtered.slice(safePage * ITEMS_PER_PAGE, (safePage + 1) * ITEMS_PER_PAGE);
  const total = cartTotal();
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div style={{ display: 'flex', height: '100%', background: '#f1f5f9', fontFamily: "'Inter', sans-serif" }}>

      {/* LEFT: Products */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Filter bar */}
        <div style={{ padding: '12px 16px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search products…"
              style={{
                width: '100%', padding: '9px 12px 9px 34px',
                border: '1.5px solid #e2e8f0', borderRadius: 10,
                fontSize: 13, fontFamily: 'inherit', outline: 'none',
                background: '#f8fafc', color: '#1e293b', boxSizing: 'border-box',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.background = 'white'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['all', 'male', 'female'] as const).map(g => (
              <button key={g} onClick={() => { setGender(g); setPage(0); }}
                style={{
                  padding: '7px 14px', borderRadius: 8,
                  border: `1.5px solid ${gender === g ? '#7c3aed' : '#e2e8f0'}`,
                  background: gender === g ? '#7c3aed' : 'white',
                  color: gender === g ? 'white' : '#64748b',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}
              >
                {g === 'all' ? 'All' : g === 'male' ? '💙 Male' : '💗 Female'}
              </button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        <div style={{
          flex: 1, overflow: 'auto',
          padding: '14px', display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 10, alignContent: 'start',
        }}>
          {pageItems.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
              <Search size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <div style={{ fontSize: 15, fontWeight: 600 }}>No products found</div>
            </div>
          ) : pageItems.map(p => <ProductCard key={p.id} product={p} />)}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '8px 14px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, gap: 8 }}>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safePage === 0}
              style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: safePage === 0 ? '#f1f5f9' : '#7c3aed', color: safePage === 0 ? '#94a3b8' : 'white', fontSize: 12, fontWeight: 700, cursor: safePage === 0 ? 'default' : 'pointer', fontFamily: 'inherit' }}
            >‹ Prev</button>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  style={{
                    width: 28, height: 28, borderRadius: 6, border: `1.5px solid ${i === safePage ? '#7c3aed' : '#e2e8f0'}`,
                    background: i === safePage ? '#7c3aed' : 'white',
                    color: i === safePage ? 'white' : '#64748b',
                    fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >{i + 1}</button>
              ))}
            </div>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={safePage >= totalPages - 1}
              style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: safePage >= totalPages - 1 ? '#f1f5f9' : '#7c3aed', color: safePage >= totalPages - 1 ? '#94a3b8' : 'white', fontSize: 12, fontWeight: 700, cursor: safePage >= totalPages - 1 ? 'default' : 'pointer', fontFamily: 'inherit' }}
            >Next ›</button>
          </div>
        )}
      </div>

      {/* RIGHT: Order Panel */}
      <div style={{
        width: 300, flexShrink: 0, background: 'white',
        borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column',
        boxShadow: '-2px 0 12px rgba(0,0,0,0.06)',
      }}>
        {/* Header */}
        <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <ShoppingCart size={18} style={{ color: '#7c3aed' }} />
            <span style={{ fontSize: 15, fontWeight: 800, color: '#1e293b' }}>Current Order</span>
          </div>
          {itemCount > 0 && (
            <div style={{
              background: '#7c3aed', color: 'white',
              borderRadius: 10, padding: '2px 9px', fontSize: 12, fontWeight: 800,
              fontFamily: "'JetBrains Mono', monospace",
            }}>{itemCount}</div>
          )}
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {cart.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8, color: '#94a3b8', padding: 24, textAlign: 'center' }}>
              <ShoppingCart size={44} style={{ opacity: 0.25 }} />
              <div style={{ fontSize: 14, fontWeight: 600 }}>No items yet</div>
              <div style={{ fontSize: 12, color: '#cbd5e1' }}>Tap a product to add it</div>
            </div>
          ) : cart.map(item => {
            const invItem = inventory.find(i => i.name === item.name);
            const maxQty = invItem ? invItem.qty : 999;
            return (
              <div key={item.id} style={{ padding: '10px 14px', borderBottom: '1px solid #f8fafc', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b', lineHeight: 1.3 }}>[R] {item.name}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>₱{item.price.toFixed(2)} each</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#7c3aed', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
                    {php(item.price * item.qty)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => updateCartQty(item.id, -1)}
                    style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.1s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.color = '#ef4444'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
                  ><Minus size={12} /></button>
                  <span style={{ fontSize: 13, fontWeight: 800, minWidth: 24, textAlign: 'center', color: '#1e293b', fontFamily: "'JetBrains Mono', monospace" }}>{item.qty}</span>
                  <button onClick={() => updateCartQty(item.id, 1)}
                    style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: '#7c3aed', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'all 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
                    onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
                  ><Plus size={12} /></button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px', borderTop: '2px solid #f1f5f9', background: '#fafafa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Order Total</span>
            <span style={{ fontSize: 26, fontWeight: 900, color: '#7c3aed', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
              {php(total)}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {cart.length > 0 && (
              <button onClick={clearCart}
                style={{
                  padding: '11px 14px', borderRadius: 10, border: 'none',
                  background: '#fee2e2', color: '#ef4444',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 5, transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
                onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
              >
                <Trash2 size={13} /> Clear
              </button>
            )}
            <button onClick={openChargeModal} disabled={total === 0}
              style={{
                flex: 1, padding: '12px', borderRadius: 10, border: 'none',
                background: total === 0 ? '#e2e8f0' : 'linear-gradient(135deg, #059669, #047857)',
                color: total === 0 ? '#94a3b8' : 'white',
                fontSize: 14, fontWeight: 800, cursor: total === 0 ? 'default' : 'pointer',
                fontFamily: 'inherit', letterSpacing: 0.4,
                boxShadow: total === 0 ? 'none' : '0 4px 14px rgba(5,150,105,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (total > 0) e.currentTarget.style.background = 'linear-gradient(135deg, #047857, #065f46)'; }}
              onMouseLeave={e => { if (total > 0) e.currentTarget.style.background = 'linear-gradient(135deg, #059669, #047857)'; }}
            >
              <CreditCard size={16} /> CHARGE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { addToCart, cart, inventory } = usePOS();
  const cartItem = cart.find(i => i.id === product.id);
  const invItem = inventory.find(i => i.name === product.name);
  const isOutOfStock = invItem ? invItem.qty <= 0 : false;
  const isMale = product.gender === 'male';

  const gradient = isMale
    ? 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #3b82f6 100%)'
    : 'linear-gradient(135deg, #9d174d 0%, #be185d 60%, #db2777 100%)';

  return (
    <button
      onClick={() => !isOutOfStock && addToCart(product)}
      disabled={isOutOfStock}
      style={{
        position: 'relative', background: gradient,
        border: cartItem ? '2.5px solid #fbbf24' : '2.5px solid transparent',
        borderRadius: 14, padding: '14px 12px 12px',
        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        minHeight: 110, textAlign: 'left',
        boxShadow: cartItem ? '0 6px 20px rgba(251,191,36,0.3)' : '0 4px 14px rgba(0,0,0,0.15)',
        transition: 'all 0.15s', opacity: isOutOfStock ? 0.55 : 1,
        fontFamily: "'Inter', sans-serif",
      }}
      onMouseEnter={e => { if (!isOutOfStock) e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* Cart badge */}
      {cartItem && (
        <div style={{
          position: 'absolute', top: 7, right: 7,
          background: '#fbbf24', color: '#1c1917',
          borderRadius: '50%', width: 22, height: 22,
          fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'JetBrains Mono', monospace",
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        }}>{cartItem.qty}</div>
      )}
      {/* Out of stock badge */}
      {isOutOfStock && (
        <div style={{
          position: 'absolute', top: 7, left: 7,
          background: 'rgba(0,0,0,0.5)', color: 'white',
          borderRadius: 5, padding: '2px 6px',
          fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8,
        }}>OUT</div>
      )}
      {/* Watermark bottle */}
      <div style={{
        position: 'absolute', right: 8, bottom: 28, width: 30, height: 45,
        opacity: 0.12, pointerEvents: 'none',
      }}>
        <svg viewBox="0 0 30 45" fill="white"><rect x="10" y="0" width="10" height="4" rx="2"/><rect x="8" y="4" width="14" height="5" rx="2"/><rect x="4" y="9" width="22" height="33" rx="5"/></svg>
      </div>
      {/* Product name */}
      <div style={{
        fontSize: 12.5, fontWeight: 700, color: 'white',
        lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box',
        WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
        textShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }}>
        [R] {product.name}
      </div>
      {/* Price */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8,
      }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.9)', fontFamily: "'JetBrains Mono', monospace" }}>
          {php(product.price)}
        </span>
        {invItem && (
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', background: 'rgba(0,0,0,0.2)', padding: '1px 5px', borderRadius: 4 }}>
            {invItem.qty} left
          </span>
        )}
      </div>
    </button>
  );
}
