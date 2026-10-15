'use client';
import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, ArrowRight } from 'lucide-react';
import { categories, type Product, money } from '@/lib/catalog';
import { ProductCard } from './product-card';
import { useStore } from './store-provider';
export function Catalog({ products, category }: { products: Product[]; category?: string }) {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [sort, setSort] = useState(params.get('sort') ?? 'relevance');
  const [type, setType] = useState('');
  const [max, setMax] = useState(150000);
  const [stock, setStock] = useState(false);
  const [cat, setCat] = useState(category ?? '');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(false);
  const { compare, toggleCompare } = useStore();
  const types = [...new Set(products.filter((p) => !cat || p.category === cat).map((p) => p.type))];
  const visible = useMemo(
    () =>
      products
        .filter(
          (p) =>
            (!cat || p.category === cat) &&
            (!q ||
              `${p.name} ${p.type} ${Object.values(p.specs).join(' ')}`
                .toLowerCase()
                .includes(q.toLowerCase())) &&
            (!type || p.type === type) &&
            p.price <= max &&
            (!stock || p.variants.some((v) => v.stock > 0)),
        )
        .sort((a, b) =>
          sort === 'low'
            ? a.price - b.price
            : sort === 'high'
              ? b.price - a.price
              : sort === 'new'
                ? b.createdAt.localeCompare(a.createdAt)
                : Number(b.featured) - Number(a.featured),
        ),
    [products, q, cat, type, max, stock, sort],
  );
  function reset() {
    setQ('');
    setCat(category ?? '');
    setType('');
    setMax(150000);
    setStock(false);
    setPage(1);
  }
  return (
    <>
      <div className="catalog-toolbar">
        <label className="catalog-search">
          <Search size={18} />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Buscá un detalle para vos"
            aria-label="Buscar productos"
          />
        </label>
        <button className="filter-toggle text-link" onClick={() => setFilters(!filters)}>
          <SlidersHorizontal size={16} /> Filtros
        </button>
        <label className="sort-label">
          Ordenar por{' '}
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="relevance">Relevancia</option>
            <option value="new">Novedades</option>
            <option value="low">Menor precio</option>
            <option value="high">Mayor precio</option>
          </select>
        </label>
      </div>
      <div className="catalog-layout">
        <aside className={'filters ' + (filters ? 'open' : '')}>
          <div className="filter-title">
            <h2>Filtrar</h2>
            <button className="text-link small" onClick={reset}>
              Limpiar
            </button>
          </div>
          {!category && (
            <label>
              Categoría
              <select
                value={cat}
                onChange={(e) => {
                  setCat(e.target.value);
                  setType('');
                  setPage(1);
                }}
              >
                <option value="">Todas</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            Tipo
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todos</option>
              {types.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            Precio máximo <strong>{money(max)}</strong>
            <input
              type="range"
              min="10000"
              max="150000"
              step="500"
              value={max}
              onChange={(e) => {
                setMax(Number(e.target.value));
                setPage(1);
              }}
            />
          </label>
          <label className="checkbox">
            <input type="checkbox" checked={stock} onChange={(e) => setStock(e.target.checked)} />
            Con stock de muestra
          </label>
          <p className="small muted">
            Materiales, marcas y especificaciones se habilitarán como filtros cuando existan datos
            comerciales verificados.
          </p>
        </aside>
        <div>
          <p className="result-count">
            {visible.length}{' '}
            {visible.length === 1 ? 'detalle para descubrir' : 'detalles para descubrir'}{' '}
            <span>· Colección demo</span>
          </p>
          {visible.length ? (
            <>
              <div className="product-grid catalog-products">
                {visible.slice((page - 1) * 9, page * 9).map((p) => (
                  <ProductCard product={p} key={p.id} />
                ))}
              </div>
              {visible.length > 9 && (
                <div className="pagination">
                  <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                    Anterior
                  </button>
                  <span>
                    {page} / {Math.ceil(visible.length / 9)}
                  </span>
                  <button disabled={page * 9 >= visible.length} onClick={() => setPage(page + 1)}>
                    Siguiente
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <Search size={32} />
              <h2>Tu próximo detalle está por descubrir.</h2>
              <p>No encontramos productos con estos filtros.</p>
              <button className="button" onClick={reset}>
                Limpiar filtros <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
      {compare.length > 0 && (
        <section className="comparison">
          <div className="section-heading">
            <h2>Compará tus favoritos</h2>
            <span className="small">Hasta 3 productos · {compare.length}/3</span>
          </div>
          <div className="comparison-grid">
            {products
              .filter((p) => compare.includes(p.id))
              .map((p) => (
                <div key={p.id}>
                  <button
                    className="icon-button"
                    onClick={() => toggleCompare(p.id)}
                    aria-label={'Quitar ' + p.name}
                  >
                    <X size={15} />
                  </button>
                  <h3>{p.name}</h3>
                  <p>{money(p.price)} · demo</p>
                  {Object.entries(p.specs).map(([k, v]) => (
                    <p className="small" key={k}>
                      {k}: {v}
                    </p>
                  ))}
                  <a href={'/producto/' + p.slug} className="text-link">
                    Ver producto <ArrowRight size={14} />
                  </a>
                </div>
              ))}
          </div>
        </section>
      )}
    </>
  );
}
