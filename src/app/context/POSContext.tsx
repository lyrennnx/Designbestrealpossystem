import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const SERVER_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-bb16b347`;
const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${publicAnonKey}`,
};

// ═══════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════
export type UserRole = 'owner' | 'employee';
export type Screen = 'sales' | 'receipts' | 'items' | 'inventory' | 'users' | 'history' | 'settings';

export interface POSUser {
  id: number; fullName: string; username: string; password: string; role: UserRole;
}
export interface Product {
  id: number; name: string; price: number; gender: 'male' | 'female';
}
export interface CartItem extends Product { qty: number; }
export interface ReceiptItem { name: string; qty: number; price: number; }
export interface Receipt {
  id: string; date: string; time: string; total: number; items: ReceiptItem[];
  payment: string; pos: string; refunded: boolean; refundOf?: string;
}
export interface InventoryItem {
  id: string; name: string; category: string; qty: number; min: number;
}
export interface InvHistoryEntry {
  type: 'add' | 'sub' | 'edit'; desc: string; time: string; date: string;
}

// ═══════════════════════════════════════════════════════════
//  PERMISSIONS
// ═══════════════════════════════════════════════════════════
const PERMISSIONS: Record<UserRole, string[]> = {
  owner: ['sales','receipts','items','inventory','users','settings','refund','addProduct','deleteProduct','editInventory'],
  employee: ['sales','receipts','inventory'],
};

// ═══════════════════════════════════════════════════════════
//  INITIAL DATA
// ═══════════════════════════════════════════════════════════
const INITIAL_USERS: POSUser[] = [
  { id: 1, fullName: 'Store Owner', username: 'admin', password: 'owner123', role: 'owner' },
  { id: 2, fullName: 'Staff Member', username: 'staff', password: 'emp123', role: 'employee' },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: '212 VIP Black 85ML', price: 150, gender: 'male' },
  { id: 2, name: 'Acqua Di Gio 85ML', price: 150, gender: 'male' },
  { id: 3, name: 'Baccarat Rouge 540 85ML', price: 150, gender: 'female' },
  { id: 4, name: 'Bombshell 85ML', price: 150, gender: 'female' },
  { id: 5, name: 'Burberry Blush 85ML', price: 150, gender: 'female' },
  { id: 6, name: 'Bvlgari Amethyste 85ML', price: 150, gender: 'female' },
  { id: 7, name: 'Bvlgari Extreme 85ML', price: 150, gender: 'male' },
  { id: 8, name: 'CK One 85ML', price: 150, gender: 'male' },
  { id: 9, name: 'Cloud Ariana Grande 85ML', price: 150, gender: 'female' },
  { id: 10, name: 'Cool Water 85ML', price: 150, gender: 'male' },
  { id: 11, name: 'D&G Light Blue 85ML', price: 150, gender: 'male' },
  { id: 12, name: "Eclat D'Aperge 85ML", price: 150, gender: 'female' },
  { id: 13, name: 'Ferrari Black 85ML', price: 150, gender: 'male' },
  { id: 14, name: 'French Riviera 85ML', price: 150, gender: 'female' },
  { id: 15, name: 'Good Girl 85ML', price: 150, gender: 'female' },
  { id: 16, name: 'Hugo Boss 85ML', price: 150, gender: 'male' },
  { id: 17, name: 'Incanto Shine 85ML', price: 150, gender: 'female' },
  { id: 18, name: 'Lacoste Black 85ML', price: 150, gender: 'male' },
  { id: 19, name: 'Lacoste Red 85ML', price: 150, gender: 'male' },
  { id: 20, name: 'Meow Katy Perry 85ML', price: 150, gender: 'female' },
  { id: 21, name: 'Montblanc 85ML', price: 150, gender: 'male' },
  { id: 22, name: 'Polo Blue 85ML', price: 150, gender: 'male' },
  { id: 23, name: 'Polo Sport 85ML', price: 150, gender: 'male' },
  { id: 24, name: 'Ralph Lauren 85ML', price: 150, gender: 'female' },
  { id: 25, name: 'Sauvage Dior 85ML', price: 150, gender: 'male' },
  { id: 26, name: 'Valaya 85ML', price: 150, gender: 'female' },
  { id: 27, name: 'Miss Dior 85ML', price: 150, gender: 'female' },
  { id: 28, name: 'Chanel No.5 85ML', price: 150, gender: 'female' },
  { id: 29, name: 'Bleu de Chanel 85ML', price: 150, gender: 'male' },
  { id: 30, name: 'Versace Eros 85ML', price: 150, gender: 'male' },
];

const INITIAL_RECEIPTS: Receipt[] = [
  { id: '#1-0004', date: '2025-11-29', time: '7:00 PM', total: 150, items: [{ name: '[R] Valaya 85ML', qty: 1, price: 150 }], payment: 'Cash', pos: 'POS 1', refunded: false },
  { id: '#1-0003', date: '2025-11-23', time: '5:46 AM', total: 150, items: [{ name: '[R] CK One 85ML', qty: 1, price: 150 }], payment: 'Cash', pos: 'POS 1', refunded: false },
  { id: '#2-0001', date: '2025-11-17', time: '7:23 PM', total: 150, items: [{ name: '[R] Valaya 85ML', qty: 1, price: 150 }], payment: 'Cash', pos: 'POS 2', refunded: false },
  { id: '#1-0002', date: '2025-11-15', time: '10:51 PM', total: 150, items: [{ name: '[R] Sauvage Dior 85ML', qty: 1, price: 150 }], payment: 'Cash', pos: 'POS 1', refundOf: '#1-0001' },
  { id: '#1-0001', date: '2025-11-15', time: '10:50 PM', total: 150, items: [{ name: '[R] Sauvage Dior 85ML', qty: 1, price: 150 }], payment: 'Cash', pos: 'POS 1', refunded: true },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'PRD-001', name: '212 VIP Black 85ML', category: 'Perfume', qty: 24, min: 5 },
  { id: 'PRD-002', name: 'Acqua Di Gio 85ML', category: 'Cologne', qty: 7, min: 5 },
  { id: 'PRD-003', name: 'Baccarat Rouge 540 85ML', category: 'Perfume', qty: 5, min: 5 },
  { id: 'PRD-004', name: 'Bombshell 85ML', category: 'Perfume', qty: 0, min: 4 },
  { id: 'PRD-005', name: 'Burberry Blush 85ML', category: 'Perfume', qty: 15, min: 6 },
  { id: 'PRD-006', name: 'Bvlgari Amethyste 85ML', category: 'Cologne', qty: 3, min: 5 },
  { id: 'PRD-007', name: 'Bvlgari Extreme 85ML', category: 'Cologne', qty: 20, min: 5 },
  { id: 'PRD-008', name: 'CK One 85ML', category: 'Body Spray', qty: 8, min: 6 },
  { id: 'PRD-009', name: 'Cloud Ariana Grande 85ML', category: 'Perfume', qty: 4, min: 4 },
  { id: 'PRD-010', name: 'Cool Water 85ML', category: 'Cologne', qty: 0, min: 5 },
  { id: 'PRD-011', name: 'D&G Light Blue 85ML', category: 'Cologne', qty: 12, min: 5 },
  { id: 'PRD-012', name: "Eclat D'Aperge 85ML", category: 'Perfume', qty: 6, min: 5 },
  { id: 'PRD-013', name: 'Ferrari Black 85ML', category: 'Cologne', qty: 30, min: 8 },
  { id: 'PRD-014', name: 'French Riviera 85ML', category: 'Perfume', qty: 2, min: 4 },
  { id: 'PRD-015', name: 'Good Girl 85ML', category: 'Perfume', qty: 10, min: 6 },
  { id: 'PRD-016', name: 'Hugo Boss 85ML', category: 'Cologne', qty: 5, min: 5 },
  { id: 'PRD-017', name: 'Incanto Shine 85ML', category: 'Perfume', qty: 0, min: 3 },
  { id: 'PRD-018', name: 'Lacoste Black 85ML', category: 'Cologne', qty: 18, min: 6 },
  { id: 'PRD-019', name: 'Lacoste Red 85ML', category: 'Cologne', qty: 7, min: 5 },
  { id: 'PRD-020', name: 'Meow Katy Perry 85ML', category: 'Perfume', qty: 3, min: 3 },
  { id: 'PRD-021', name: 'Montblanc 85ML', category: 'Cologne', qty: 22, min: 7 },
  { id: 'PRD-022', name: 'Polo Blue 85ML', category: 'Cologne', qty: 9, min: 6 },
  { id: 'PRD-023', name: 'Polo Sport 85ML', category: 'Body Spray', qty: 4, min: 5 },
  { id: 'PRD-024', name: 'Ralph Lauren 85ML', category: 'Perfume', qty: 14, min: 6 },
  { id: 'PRD-025', name: 'Sauvage Dior 85ML', category: 'Cologne', qty: 35, min: 10 },
  { id: 'PRD-026', name: 'Valaya 85ML', category: 'Perfume', qty: 1, min: 4 },
  { id: 'PRD-027', name: 'Miss Dior 85ML', category: 'Perfume', qty: 11, min: 5 },
  { id: 'PRD-028', name: 'Chanel No.5 85ML', category: 'Perfume', qty: 6, min: 5 },
  { id: 'PRD-029', name: 'Bleu de Chanel 85ML', category: 'Cologne', qty: 0, min: 4 },
  { id: 'PRD-030', name: 'Versace Eros 85ML', category: 'Cologne', qty: 8, min: 7 },
];

// ═══════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════
export const php = (n: number) => '₱' + Number(n).toFixed(2);
export function nowDate() {
  const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
}
export function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
export function pad(n: number, len = 4) { return String(n).padStart(len, '0'); }
export function invStatus(qty: number, min: number): 'In Stock' | 'Low Stock' | 'Need Restock' | 'Out of Stock' {
  if (qty <= 0) return 'Out of Stock';
  if (qty <= min / 2) return 'Need Restock';
  if (qty <= min) return 'Low Stock';
  return 'In Stock';
}
export function formatDateLabel(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

// ═══════════════════════════════════════════════════════════
//  STORAGE
// ═══════════════════════════════════════════════════════════
const STORAGE_KEY = 'fragrance-pos-state-v2';
const SESSION_KEY = 'fragrance-pos-session-v2';

// ═══════════════════════════════════════════════════════════
//  CONTEXT TYPE
// ═══════════════════════════════════════════════════════════
interface POSContextValue {
  // Auth
  currentUser: POSUser | null;
  login: (username: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  can: (action: string) => boolean;
  // Navigation
  currentScreen: Screen;
  setScreen: (s: Screen) => void;
  // Products
  products: Product[];
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (id: number, p: Partial<Omit<Product,'id'>>) => void;
  deleteProduct: (id: number) => void;
  // Cart
  cart: CartItem[];
  addToCart: (p: Product) => void;
  updateCartQty: (id: number, delta: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  // Receipts + Checkout
  receipts: Receipt[];
  receiptCounter: number;
  checkout: (payment: string) => void;
  refundReceipt: (receiptId: string) => void;
  // Inventory
  inventory: InventoryItem[];
  invHistory: InvHistoryEntry[];
  invNextNum: number;
  addInventoryItem: (item: Omit<InventoryItem, ''>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  adjustStock: (id: string, delta: number, reason: string) => void;
  // Users
  users: POSUser[];
  addUser: (u: Omit<POSUser, 'id'>) => void;
  updateUser: (id: number, u: Partial<Omit<POSUser,'id'>>) => void;
  deleteUser: (id: number) => void;
  // Toast
  toastMsg: string | null;
  showToast: (msg: string) => void;
  // Access Denied
  accessDenied: boolean;
  triggerAccessDenied: () => void;
  dismissAccessDenied: () => void;
  // Modal state
  chargeModalOpen: boolean;
  openChargeModal: () => void;
  closeChargeModal: () => void;
  refundModal: { open: boolean; receipt: Receipt | null };
  openRefundModal: (r: Receipt) => void;
  closeRefundModal: () => void;
  productModal: { open: boolean; product: Product | null };
  openProductModal: (p?: Product) => void;
  closeProductModal: () => void;
  invModal: { open: boolean; item: InventoryItem | null };
  openInvModal: (item?: InventoryItem) => void;
  closeInvModal: () => void;
  adjustModal: { open: boolean; item: InventoryItem | null };
  openAdjustModal: (item: InventoryItem) => void;
  closeAdjustModal: () => void;
  userModal: { open: boolean; user: POSUser | null };
  openUserModal: (u?: POSUser) => void;
  closeUserModal: () => void;
  selectedReceipt: Receipt | null;
  setSelectedReceipt: (r: Receipt | null) => void;
}

const POSContext = createContext<POSContextValue | null>(null);

export function usePOS() {
  const ctx = useContext(POSContext);
  if (!ctx) throw new Error('usePOS must be used within POSProvider');
  return ctx;
}

// ═══════════════════════════════════════════════════════════
//  PROVIDER
// ═══════════════════════════════════════════════════════════
export function POSProvider({ children }: { children: React.ReactNode }) {
  // ── State ──────────────────────────────────────────────────
  const [users, setUsers] = useState<POSUser[]>(INITIAL_USERS);
  const [nextUserId, setNextUserId] = useState(3);
  const [currentUser, setCurrentUser] = useState<POSUser | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('sales');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [nextProductId, setNextProductId] = useState(31);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>(INITIAL_RECEIPTS);
  const [receiptCounter, setReceiptCounter] = useState(1);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [invHistory, setInvHistory] = useState<InvHistoryEntry[]>([]);
  const [invNextNum, setInvNextNum] = useState(31);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Modals
  const [chargeModalOpen, setChargeModalOpen] = useState(false);
  const [refundModal, setRefundModal] = useState<{ open: boolean; receipt: Receipt | null }>({ open: false, receipt: null });
  const [productModal, setProductModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
  const [invModal, setInvModal] = useState<{ open: boolean; item: InventoryItem | null }>({ open: false, item: null });
  const [adjustModal, setAdjustModal] = useState<{ open: boolean; item: InventoryItem | null }>({ open: false, item: null });
  const [userModal, setUserModal] = useState<{ open: boolean; user: POSUser | null }>({ open: false, user: null });
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  // ── Persist / Load ─────────────────────────────────────────
  const applyState = useCallback((s: any) => {
    if (!s) return;
    if (s.users) setUsers(s.users);
    if (s.nextUserId) setNextUserId(s.nextUserId);
    if (s.products) setProducts(s.products);
    if (s.nextProductId) setNextProductId(s.nextProductId);
    if (s.cart) setCart(s.cart);
    if (s.receipts) setReceipts(s.receipts);
    if (typeof s.receiptCounter === 'number') setReceiptCounter(s.receiptCounter);
    if (s.inventory) setInventory(s.inventory);
    if (s.invHistory) setInvHistory(s.invHistory);
    if (s.invNextNum) setInvNextNum(s.invNextNum);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let usersForSession: POSUser[] = INITIAL_USERS;

    // Seed instantly from local cache for offline/fast paint.
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        applyState(s);
        if (s.users) usersForSession = s.users;
      }
    } catch {}

    // Fetch authoritative state from Supabase.
    (async () => {
      try {
        const res = await fetch(`${SERVER_BASE}/state`, { headers: AUTH_HEADERS });
        if (!res.ok) {
          const text = await res.text();
          console.log(`Failed to load POS state from server (status ${res.status}): ${text}`);
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        if (data?.state) {
          applyState(data.state);
          if (data.state.users) usersForSession = data.state.users;
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data.state)); } catch {}
        }
      } catch (err) {
        console.log(`Error loading POS state from server: ${err}`);
      } finally {
        // Restore session after we have the latest user list.
        try {
          const sess = localStorage.getItem(SESSION_KEY);
          if (sess && !cancelled) {
            const { username, role } = JSON.parse(sess);
            const u = usersForSession.find(x => x.username === username && x.role === role);
            if (u) setCurrentUser(u);
          }
        } catch {}
      }
    })();

    return () => { cancelled = true; };
  }, [applyState]);

  const saveState = useCallback((newState?: Partial<{
    users: POSUser[]; nextUserId: number; products: Product[]; nextProductId: number;
    cart: CartItem[]; receipts: Receipt[]; receiptCounter: number;
    inventory: InventoryItem[]; invHistory: InvHistoryEntry[]; invNextNum: number;
  }>) => {
    try {
      const state = {
        users: newState?.users ?? users,
        nextUserId: newState?.nextUserId ?? nextUserId,
        products: newState?.products ?? products,
        nextProductId: newState?.nextProductId ?? nextProductId,
        cart: newState?.cart ?? cart,
        receipts: newState?.receipts ?? receipts,
        receiptCounter: newState?.receiptCounter ?? receiptCounter,
        inventory: newState?.inventory ?? inventory,
        invHistory: newState?.invHistory ?? invHistory,
        invNextNum: newState?.invNextNum ?? invNextNum,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      // Persist to Supabase (fire-and-forget; localStorage is the offline fallback).
      fetch(`${SERVER_BASE}/state`, {
        method: 'POST',
        headers: AUTH_HEADERS,
        body: JSON.stringify({ state }),
      }).then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          console.log(`Failed to save POS state to server (status ${res.status}): ${text}`);
        }
      }).catch((err) => {
        console.log(`Network error saving POS state to server: ${err}`);
      });
    } catch {}
  }, [users, nextUserId, products, nextProductId, cart, receipts, receiptCounter, inventory, invHistory, invNextNum]);

  // ── Helpers ────────────────────────────────────────────────
  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2800);
  }, []);

  const can = useCallback((action: string) => {
    if (!currentUser) return false;
    return PERMISSIONS[currentUser.role]?.includes(action) ?? false;
  }, [currentUser]);

  const cartTotal = useCallback(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);

  const addInvHistory = useCallback((type: InvHistoryEntry['type'], desc: string, newInvHistory?: InvHistoryEntry[]) => {
    const entry: InvHistoryEntry = { type, desc, time: nowTime(), date: nowDate() };
    const updated = [entry, ...(newInvHistory ?? invHistory)];
    setInvHistory(updated);
    return updated;
  }, [invHistory]);

  // ── Auth ───────────────────────────────────────────────────
  const login = useCallback((username: string, password: string, role: UserRole): boolean => {
    const u = users.find(x => x.username === username && x.password === password && x.role === role);
    if (!u) return false;
    setCurrentUser(u);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ username: u.username, role: u.role }));
    return true;
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
    setCart([]);
    setCurrentScreen('sales');
  }, []);

  // ── Screen ─────────────────────────────────────────────────
  const setScreen = useCallback((s: Screen) => {
    const restricted: Partial<Record<Screen, string>> = { items: 'addProduct', settings: 'settings', users: 'users' };
    if (restricted[s] && !can(restricted[s]!)) {
      setAccessDenied(true);
      return;
    }
    setCurrentScreen(s);
  }, [can]);

  // ── Products ───────────────────────────────────────────────
  const addProduct = useCallback((p: Omit<Product, 'id'>) => {
    const newId = nextProductId;
    const updated = [...products, { ...p, id: newId }];
    setProducts(updated);
    setNextProductId(newId + 1);
    saveState({ products: updated, nextProductId: newId + 1 });
    showToast('Product added successfully.');
  }, [products, nextProductId, saveState, showToast]);

  const updateProduct = useCallback((id: number, p: Partial<Omit<Product,'id'>>) => {
    const updated = products.map(x => x.id === id ? { ...x, ...p } : x);
    setProducts(updated);
    saveState({ products: updated });
    showToast('Product updated successfully.');
  }, [products, saveState, showToast]);

  const deleteProduct = useCallback((id: number) => {
    const updated = products.filter(x => x.id !== id);
    const updatedCart = cart.filter(x => x.id !== id);
    setProducts(updated);
    setCart(updatedCart);
    saveState({ products: updated, cart: updatedCart });
    showToast('Product deleted.');
  }, [products, cart, saveState, showToast]);

  // ── Cart ───────────────────────────────────────────────────
  const addToCart = useCallback((p: Product) => {
    const invItem = inventory.find(i => i.name === p.name);
    if (invItem && invItem.qty <= 0) { showToast('Item is out of stock.'); return; }
    const existing = cart.find(i => i.id === p.id);
    let updated: CartItem[];
    if (existing) {
      updated = cart.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
    } else {
      updated = [...cart, { ...p, qty: 1 }];
    }
    setCart(updated);
    saveState({ cart: updated });
    if (invItem && invItem.qty <= invItem.min) showToast('⚠ Low stock on this item.');
    else showToast('Added to order.');
  }, [cart, inventory, saveState, showToast]);

  const updateCartQty = useCallback((id: number, delta: number) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    let updated: CartItem[];
    if (item.qty + delta <= 0) {
      updated = cart.filter(i => i.id !== id);
      showToast('Item removed from order.');
    } else {
      updated = cart.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i);
    }
    setCart(updated);
    saveState({ cart: updated });
  }, [cart, saveState, showToast]);

  const clearCart = useCallback(() => {
    if (cart.length === 0) { showToast('Order is already empty.'); return; }
    setCart([]);
    saveState({ cart: [] });
    showToast('Order cleared.');
  }, [cart, saveState, showToast]);

  // ── Checkout ───────────────────────────────────────────────
  const checkout = useCallback((payment: string) => {
    const newCounter = receiptCounter + 1;
    const r: Receipt = {
      id: `#2-${pad(newCounter)}`,
      date: nowDate(), time: nowTime(),
      total: cartTotal(),
      items: cart.map(i => ({ name: `[R] ${i.name}`, qty: i.qty, price: i.price })),
      payment, pos: 'POS 2', refunded: false,
    };
    const newReceipts = [r, ...receipts];
    setReceipts(newReceipts);
    setReceiptCounter(newCounter);

    // Deduct from inventory
    let newInv = [...inventory];
    let newInvHist = [...invHistory];
    cart.forEach(cartItem => {
      const idx = newInv.findIndex(inv => inv.name === cartItem.name);
      if (idx >= 0) {
        const oldQty = newInv[idx].qty;
        const newQty = Math.max(0, oldQty - cartItem.qty);
        newInv[idx] = { ...newInv[idx], qty: newQty };
        newInvHist = [{ type: 'sub', desc: `Sale: ${cartItem.name} −${cartItem.qty} (${oldQty}→${newQty}) [${r.id}]`, time: nowTime(), date: nowDate() }, ...newInvHist];
      }
    });
    setInventory(newInv);
    setInvHistory(newInvHist);
    setCart([]);
    saveState({ receipts: newReceipts, receiptCounter: newCounter, inventory: newInv, invHistory: newInvHist, cart: [] });
    setChargeModalOpen(false);
    showToast('✓ Transaction completed successfully!');
  }, [cart, cartTotal, receipts, receiptCounter, inventory, invHistory, saveState, showToast]);

  // ── Refund ─────────────────────────────────────────────────
  const refundReceipt = useCallback((receiptId: string) => {
    const orig = receipts.find(r => r.id === receiptId);
    if (!orig) return;
    const newCounter = receiptCounter + 1;
    const refundRec: Receipt = {
      id: `#2-${pad(newCounter)}`, date: nowDate(), time: nowTime(),
      total: orig.total, items: orig.items, payment: orig.payment, pos: 'POS 2', refunded: false, refundOf: orig.id,
    };
    const newReceipts = [refundRec, ...receipts.map(r => r.id === receiptId ? { ...r, refunded: true } : r)];
    setReceipts(newReceipts);
    setReceiptCounter(newCounter);
    setSelectedReceipt(refundRec);

    // Restore inventory
    let newInv = [...inventory];
    let newInvHist = [...invHistory];
    orig.items.forEach(item => {
      const cleanName = item.name.replace(/^\[R\] /, '');
      const idx = newInv.findIndex(inv => inv.name === cleanName);
      if (idx >= 0) {
        const oldQty = newInv[idx].qty;
        const newQty = oldQty + item.qty;
        newInv[idx] = { ...newInv[idx], qty: newQty };
        newInvHist = [{ type: 'add', desc: `Refund: ${cleanName} +${item.qty} (${oldQty}→${newQty}) [${orig.id}]`, time: nowTime(), date: nowDate() }, ...newInvHist];
      }
    });
    setInventory(newInv);
    setInvHistory(newInvHist);
    setRefundModal({ open: false, receipt: null });
    saveState({ receipts: newReceipts, receiptCounter: newCounter, inventory: newInv, invHistory: newInvHist });
    showToast('↩ Refund processed.');
  }, [receipts, receiptCounter, inventory, invHistory, saveState, showToast]);

  // ── Inventory ──────────────────────────────────────────────
  const addInventoryItem = useCallback((item: InventoryItem) => {
    const exists = inventory.find(i => i.id === item.id);
    if (exists) { showToast('Product ID already exists.'); return; }
    const updated = [...inventory, item];
    const newNum = invNextNum + 1;
    setInventory(updated);
    setInvNextNum(newNum);
    const newInvHist = [{ type: 'add' as const, desc: `Added: ${item.name} (qty: ${item.qty})`, time: nowTime(), date: nowDate() }, ...invHistory];
    setInvHistory(newInvHist);
    saveState({ inventory: updated, invNextNum: newNum, invHistory: newInvHist });
    showToast('Inventory item added.');
  }, [inventory, invNextNum, invHistory, saveState, showToast]);

  const updateInventoryItem = useCallback((id: string, updates: Partial<InventoryItem>) => {
    const updated = inventory.map(i => i.id === id ? { ...i, ...updates } : i);
    setInventory(updated);
    const newInvHist = [{ type: 'edit' as const, desc: `Updated: ${inventory.find(i=>i.id===id)?.name ?? id}`, time: nowTime(), date: nowDate() }, ...invHistory];
    setInvHistory(newInvHist);
    saveState({ inventory: updated, invHistory: newInvHist });
    showToast('Inventory item updated.');
  }, [inventory, invHistory, saveState, showToast]);

  const deleteInventoryItem = useCallback((id: string) => {
    const item = inventory.find(i => i.id === id);
    const updated = inventory.filter(i => i.id !== id);
    setInventory(updated);
    const newInvHist = [{ type: 'sub' as const, desc: `Deleted: ${item?.name ?? id}`, time: nowTime(), date: nowDate() }, ...invHistory];
    setInvHistory(newInvHist);
    saveState({ inventory: updated, invHistory: newInvHist });
    showToast('Inventory item deleted.');
  }, [inventory, invHistory, saveState, showToast]);

  const adjustStock = useCallback((id: string, delta: number, reason: string) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return;
    const oldQty = item.qty;
    const newQty = Math.max(0, oldQty + delta);
    const updated = inventory.map(i => i.id === id ? { ...i, qty: newQty } : i);
    setInventory(updated);
    const newInvHist = [{ type: (delta > 0 ? 'add' : 'sub') as const, desc: `${reason}: ${item.name} ${delta > 0 ? '+' : ''}${delta} (${oldQty}→${newQty})`, time: nowTime(), date: nowDate() }, ...invHistory];
    setInvHistory(newInvHist);
    saveState({ inventory: updated, invHistory: newInvHist });
    showToast(`Stock adjusted: ${newQty} units.`);
  }, [inventory, invHistory, saveState, showToast]);

  // ── Users ──────────────────────────────────────────────────
  const addUser = useCallback((u: Omit<POSUser, 'id'>) => {
    if (users.find(x => x.username === u.username)) { showToast('Username already taken.'); return; }
    const newId = nextUserId;
    const updated = [...users, { ...u, id: newId }];
    setUsers(updated);
    setNextUserId(newId + 1);
    saveState({ users: updated, nextUserId: newId + 1 });
    showToast('User added successfully.');
  }, [users, nextUserId, saveState, showToast]);

  const updateUser = useCallback((id: number, u: Partial<Omit<POSUser,'id'>>) => {
    if (u.username) {
      const dup = users.find(x => x.username === u.username && x.id !== id);
      if (dup) { showToast('Username already taken.'); return; }
    }
    const updated = users.map(x => x.id === id ? { ...x, ...u } : x);
    setUsers(updated);
    if (currentUser?.id === id) setCurrentUser(prev => prev ? { ...prev, ...u } : prev);
    saveState({ users: updated });
    showToast('User updated successfully.');
  }, [users, currentUser, saveState, showToast]);

  const deleteUser = useCallback((id: number) => {
    const updated = users.filter(x => x.id !== id);
    setUsers(updated);
    saveState({ users: updated });
    showToast('User deleted.');
  }, [users, saveState, showToast]);

  // ── Modal helpers ──────────────────────────────────────────
  const openChargeModal = useCallback(() => setChargeModalOpen(true), []);
  const closeChargeModal = useCallback(() => setChargeModalOpen(false), []);
  const openRefundModal = useCallback((r: Receipt) => setRefundModal({ open: true, receipt: r }), []);
  const closeRefundModal = useCallback(() => setRefundModal({ open: false, receipt: null }), []);
  const openProductModal = useCallback((p?: Product) => setProductModal({ open: true, product: p ?? null }), []);
  const closeProductModal = useCallback(() => setProductModal({ open: false, product: null }), []);
  const openInvModal = useCallback((item?: InventoryItem) => setInvModal({ open: true, item: item ?? null }), []);
  const closeInvModal = useCallback(() => setInvModal({ open: false, item: null }), []);
  const openAdjustModal = useCallback((item: InventoryItem) => setAdjustModal({ open: true, item }), []);
  const closeAdjustModal = useCallback(() => setAdjustModal({ open: false, item: null }), []);
  const openUserModal = useCallback((u?: POSUser) => setUserModal({ open: true, user: u ?? null }), []);
  const closeUserModal = useCallback(() => setUserModal({ open: false, user: null }), []);
  const triggerAccessDenied = useCallback(() => setAccessDenied(true), []);
  const dismissAccessDenied = useCallback(() => setAccessDenied(false), []);

  const value: POSContextValue = {
    currentUser, login, logout, can,
    currentScreen, setScreen,
    products, addProduct, updateProduct, deleteProduct,
    cart, addToCart, updateCartQty, clearCart, cartTotal,
    receipts, receiptCounter, checkout, refundReceipt,
    inventory, invHistory, invNextNum, addInventoryItem, updateInventoryItem, deleteInventoryItem, adjustStock,
    users, addUser, updateUser, deleteUser,
    toastMsg, showToast,
    accessDenied, triggerAccessDenied, dismissAccessDenied,
    chargeModalOpen, openChargeModal, closeChargeModal,
    refundModal, openRefundModal, closeRefundModal,
    productModal, openProductModal, closeProductModal,
    invModal, openInvModal, closeInvModal,
    adjustModal, openAdjustModal, closeAdjustModal,
    userModal, openUserModal, closeUserModal,
    selectedReceipt, setSelectedReceipt,
  };

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>;
}