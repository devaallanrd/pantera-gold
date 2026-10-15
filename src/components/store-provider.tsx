'use client';
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Product } from '@/lib/catalog';
export type CartLine = { variantId: string; quantity: number };
type Store = {
  items: CartLine[];
  add: (variantId: string, quantity: number) => void;
  update: (id: string, q: number) => void;
  clear: () => void;
  count: number;
  ready: boolean;
  compare: string[];
  toggleCompare: (id: string) => void;
  notice: string;
};
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('pg-cart') ?? '[]');
      if (Array.isArray(data))
        setItems(
          data
            .filter(
              (x) =>
                typeof x.variantId === 'string' &&
                Number.isInteger(x.quantity) &&
                x.quantity > 0 &&
                x.quantity <= 20,
            )
            .slice(0, 40),
        );
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem('pg-cart', JSON.stringify(items));
  }, [items, ready]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(t);
  }, [notice]);
  const add = useCallback((variantId: string, quantity: number) => {
    setItems((old) => {
      const found = old.find((x) => x.variantId === variantId);
      return found
        ? old.map((x) =>
            x.variantId === variantId ? { ...x, quantity: Math.min(20, x.quantity + quantity) } : x,
          )
        : [...old, { variantId, quantity }];
    });
    setNotice('Producto agregado al carrito');
  }, []);
  return (
    <Context.Provider
      value={{
        items,
        add,
        update: (id, q) =>
          setItems((old) =>
            q <= 0
              ? old.filter((x) => x.variantId !== id)
              : old.map((x) => (x.variantId === id ? { ...x, quantity: Math.min(20, q) } : x)),
          ),
        clear: () => setItems([]),
        count: items.reduce((n, x) => n + x.quantity, 0),
        ready,
        compare,
        toggleCompare: (id) =>
          setCompare((old) =>
            old.includes(id) ? old.filter((x) => x !== id) : old.length < 3 ? [...old, id] : old,
          ),
        notice,
      }}
    >
      {children}
      <div className={`toast ${notice ? 'visible' : ''}`} role="status">
        {notice}
      </div>
    </Context.Provider>
  );
}
export function useStore() {
  const c = useContext(Context);
  if (!c) throw Error('StoreProvider missing');
  return c;
}
export function useCartProducts(products: Product[]) {
  const { items } = useStore();
  return items.map((i) => {
    const product = products.find((p) => p.variants.some((v) => v.id === i.variantId));
    return { ...i, product, variant: product?.variants.find((v) => v.id === i.variantId) };
  });
}
