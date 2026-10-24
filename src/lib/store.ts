"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartLine, Undertone } from "./types";

const storage = createJSONStorage(() => {
  try {
    const k = "__lunae_probe";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return localStorage;
  } catch {
    const mem = new Map<string, string>();
    return {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => void mem.set(k, v),
      removeItem: (k: string) => void mem.delete(k),
    };
  }
});

/* ---------------- Cart ---------------- */
interface CartState {
  lines: CartLine[];
  saved: CartLine[];
  voucher: string;
  add: (l: CartLine) => void;
  setQty: (i: number, qty: number) => void;
  setShade: (i: number, shade: string) => void;
  remove: (i: number) => void;
  saveForLater: (i: number) => void;
  moveToBag: (i: number) => void;
  setVoucher: (v: string) => void;
  clear: () => void;
}
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      saved: [],
      voucher: "",
      add: (l) =>
        set((s) => {
          const idx = s.lines.findIndex((x) => x.slug === l.slug && x.shade === l.shade);
          if (idx >= 0) {
            const lines = [...s.lines];
            lines[idx] = { ...lines[idx], qty: Math.min(10, lines[idx].qty + l.qty) };
            return { lines };
          }
          return { lines: [...s.lines, l] };
        }),
      setQty: (i, qty) => set((s) => ({ lines: s.lines.map((l, j) => (j === i ? { ...l, qty: Math.max(1, Math.min(10, qty)) } : l)) })),
      setShade: (i, shade) => set((s) => ({ lines: s.lines.map((l, j) => (j === i ? { ...l, shade } : l)) })),
      remove: (i) => set((s) => ({ lines: s.lines.filter((_, j) => j !== i) })),
      saveForLater: (i) => set((s) => ({ saved: [...s.saved, s.lines[i]], lines: s.lines.filter((_, j) => j !== i) })),
      moveToBag: (i) => set((s) => ({ lines: [...s.lines, s.saved[i]], saved: s.saved.filter((_, j) => j !== i) })),
      setVoucher: (voucher) => set({ voucher }),
      clear: () => set({ lines: [], voucher: "" }),
    }),
    { name: "lunae-cart", storage, skipHydration: true },
  ),
);

/* ---------------- Wishlist ---------------- */
interface WishState {
  items: string[];
  toggle: (slug: string) => void;
  has: (slug: string) => boolean;
}
export const useWishlist = create<WishState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (slug) => set((s) => ({ items: s.items.includes(slug) ? s.items.filter((x) => x !== slug) : [...s.items, slug] })),
      has: (slug) => get().items.includes(slug),
    }),
    { name: "lunae-wishlist", storage, skipHydration: true },
  ),
);

/* ---------------- Skin & shade profile (colour values only, never images) ---------------- */
export interface ShadeProfile {
  shade: string; // base shade name e.g. "Madu"
  code: string;
  hex: string;
  undertone: Undertone;
  skinType?: "dry" | "normal" | "combination" | "oily";
  concerns?: string[];
  confidence: number;
  method: "selfie" | "quiz";
  at: string;
}
interface ProfileState {
  profile: ShadeProfile | null;
  myShadesOnly: boolean;
  setProfile: (p: ShadeProfile | null) => void;
  setMyShadesOnly: (v: boolean) => void;
}
export const useProfile = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      myShadesOnly: false,
      setProfile: (profile) => set({ profile }),
      setMyShadesOnly: (myShadesOnly) => set({ myShadesOnly }),
    }),
    { name: "lunae-profile", storage, skipHydration: true },
  ),
);

/* ---------------- Account (demo session, orders, points ledger, consents) ---------------- */
export interface OrderRecord {
  no: string;
  at: string;
  lines: (CartLine & { name: string; unit: number })[];
  total: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  sst: number;
  pointsUsed: number;
  pointsEarned: number;
  status: "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "COMPLETED" | "CANCELLED";
  courier: string;
  eta: string;
  address: string;
  email: string;
  phone: string;
  payment: string;
  gift?: boolean;
}
export interface Address {
  id: string;
  label: string;
  line1: string;
  postcode: string;
  city: string;
  state: string;
  isDefault: boolean;
}
interface AccountState {
  user: { name: string; email: string; phone: string; since: string } | null;
  orders: OrderRecord[];
  ledger: { at: string; points: number; reason: string }[];
  addresses: Address[];
  consents: { marketingEmail: boolean; marketingWhatsApp: boolean; push: boolean; personalisation: boolean; analytics: boolean };
  passkeys: { id: string; device: string; at: string }[];
  waitlist: string[];
  signIn: (u: { name: string; email: string; phone: string }) => void;
  signOut: () => void;
  addOrder: (o: OrderRecord) => void;
  addPoints: (points: number, reason: string) => void;
  saveAddress: (a: Address) => void;
  removeAddress: (id: string) => void;
  setConsent: (k: keyof AccountState["consents"], v: boolean) => void;
  addPasskey: (device: string) => void;
  removePasskey: (id: string) => void;
  joinWaitlist: (key: string) => void;
  deleteAll: () => void;
}
const defaultConsents = { marketingEmail: false, marketingWhatsApp: false, push: false, personalisation: true, analytics: false };
export const useAccount = create<AccountState>()(
  persist(
    (set) => ({
      user: null,
      orders: [],
      ledger: [],
      addresses: [],
      consents: defaultConsents,
      passkeys: [],
      waitlist: [],
      signIn: (u) =>
        set((s) => {
          const first = !s.user && s.ledger.length === 0;
          return {
            user: { ...u, since: s.user?.since ?? new Date().toISOString() },
            ledger: first ? [{ at: new Date().toISOString(), points: 200, reason: "Welcome to Lunae Circle" }, ...s.ledger] : s.ledger,
          };
        }),
      signOut: () => set({ user: null }),
      addOrder: (o) => set((s) => ({ orders: [o, ...s.orders] })),
      addPoints: (points, reason) => set((s) => ({ ledger: [{ at: new Date().toISOString(), points, reason }, ...s.ledger] })),
      saveAddress: (a) =>
        set((s) => {
          const others = s.addresses.filter((x) => x.id !== a.id).map((x) => (a.isDefault ? { ...x, isDefault: false } : x));
          return { addresses: [...others, a] };
        }),
      removeAddress: (id) => set((s) => ({ addresses: s.addresses.filter((a) => a.id !== id) })),
      setConsent: (k, v) => set((s) => ({ consents: { ...s.consents, [k]: v } })),
      addPasskey: (device) => set((s) => ({ passkeys: [...s.passkeys, { id: crypto.randomUUID(), device, at: new Date().toISOString() }] })),
      removePasskey: (id) => set((s) => ({ passkeys: s.passkeys.filter((p) => p.id !== id) })),
      joinWaitlist: (key) => set((s) => ({ waitlist: s.waitlist.includes(key) ? s.waitlist : [...s.waitlist, key] })),
      deleteAll: () => set({ user: null, orders: [], ledger: [], addresses: [], consents: defaultConsents, passkeys: [], waitlist: [] }),
    }),
    { name: "lunae-account", storage, skipHydration: true },
  ),
);

export const pointsBalance = (ledger: { points: number }[]) => ledger.reduce((a, l) => a + l.points, 0);

/* ---------------- UI (not persisted) ---------------- */
interface UIState {
  cartOpen: boolean;
  advisorOpen: boolean;
  searchOpen: boolean;
  menuOpen: boolean;
  toast: { id: number; kind: "success" | "warning" | "error" | "info"; text: string } | null;
  set: (p: Partial<Omit<UIState, "set" | "notify">>) => void;
  notify: (text: string, kind?: "success" | "warning" | "error" | "info") => void;
}
export const useUI = create<UIState>()((set) => ({
  cartOpen: false,
  advisorOpen: false,
  searchOpen: false,
  menuOpen: false,
  toast: null,
  set: (p) => set(p),
  notify: (text, kind = "success") => set({ toast: { id: Date.now(), kind, text } }),
}));

export const rehydrateAll = () => {
  useCart.persist.rehydrate();
  useWishlist.persist.rehydrate();
  useProfile.persist.rehydrate();
  useAccount.persist.rehydrate();
};
