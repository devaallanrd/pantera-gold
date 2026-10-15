'use client';
import Link from 'next/link';
import { Search, ShoppingBag, Menu, X, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useStore } from './store-provider';
export function Header() {
  const { count } = useStore();
  const [open, setOpen] = useState(false);
  const path = usePathname();
  return (
    <>
      <div className="announcement">
        ESTÁS EXPLORANDO UNA TIENDA DE DEMOSTRACIÓN <span>· No se realizan cobros reales</span>
        <ArrowUpRight size={12} />
      </div>
      <header className="site-header">
        <Link href="/" className="wordmark" aria-label="Pantera Gold CR, inicio">
          <span className="brand-emblem">
            P<span>G</span>
          </span>
          <span>
            PANTERA GOLD<small>COSTA RICA</small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Navegación principal">
          {[
            ['/joyeria', 'Joyería'],
            ['/relojes', 'Relojes'],
            ['/colonias', 'Colonias'],
            ['/catalogo?sort=new', 'Novedades'],
          ].map(([url, label]) => (
            <Link className={path === url ? 'active' : ''} key={url} href={url}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link href="/catalogo" aria-label="Buscar productos">
            <Search size={21} />
          </Link>
          <Link className="bag-link" href="/carrito" aria-label={`Carrito, ${count} artículos`}>
            <ShoppingBag size={21} />
            <span>{count}</span>
          </Link>
          <button
            className="mobile-menu icon-button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {open && (
        <nav className="mobile-nav" aria-label="Navegación móvil">
          {[
            ['/', 'Inicio'],
            ['/joyeria', 'Joyería'],
            ['/relojes', 'Relojes'],
            ['/colonias', 'Colonias'],
            ['/nosotros', 'Nosotros'],
            ['/seguimiento', 'Seguir pedido'],
          ].map(([url, label]) => (
            <Link key={url} href={url} onClick={() => setOpen(false)}>
              {label}
              <ArrowUpRight size={16} />
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
