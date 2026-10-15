'use client';
import { categories, imageOptions } from '@/lib/catalog';
import type { AdminProduct } from './types';
export function ProductForm({
  editing,
  save,
  busy,
  onCancel,
}: {
  editing: AdminProduct | null;
  save: (e: React.FormEvent<HTMLFormElement>) => void;
  busy: boolean;
  onCancel: () => void;
}) {
  return (
    <form className="admin-box product-form" onSubmit={save}>
      <h2>{editing ? 'Editar producto' : 'Nuevo producto de demostración'}</h2>
      <div className="form-grid">
        <label>
          Nombre
          <input name="name" required defaultValue={editing?.name} minLength={2} maxLength={100} />
        </label>
        <label>
          Slug
          <input name="slug" required pattern="[a-z0-9-]+" defaultValue={editing?.slug} />
        </label>
        <label>
          Categoría
          <select name="category" defaultValue={editing?.category}>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tipo / subcategoría
          <input name="type" required defaultValue={editing?.type} maxLength={60} />
        </label>
        <label className="full">
          Descripción
          <textarea
            name="description"
            required
            minLength={10}
            maxLength={2000}
            defaultValue={editing?.description}
          />
        </label>
        <label>
          Precio demo CRC
          <input
            name="price"
            type="number"
            required
            min="1"
            step="1"
            defaultValue={editing?.price}
          />
        </label>
        <label>
          Costo interno CRC (opcional)
          <input name="cost" type="number" min="0" step="1" defaultValue={editing?.cost ?? ''} />
        </label>
        <label>
          SKU
          <input name="sku" required defaultValue={editing?.variants[0]?.sku} />
        </label>
        <label>
          Nombre de variante
          <input
            name="variantName"
            required
            defaultValue={editing?.variants[0]?.name ?? 'Modelo de muestra'}
          />
        </label>
        <label>
          Stock de muestra
          <input
            name="stock"
            type="number"
            min="0"
            max="100000"
            required
            defaultValue={editing?.variants[0]?.stock ?? 0}
          />
        </label>
        <label>
          Imagen conceptual
          <select name="image" defaultValue={editing?.image}>
            {imageOptions.map((i, n) => (
              <option key={i} value={i}>
                {['Joyería', 'Reloj', 'Fragancia'][n]}
              </option>
            ))}
          </select>
        </label>
        <label className="checkbox">
          <input name="active" type="checkbox" defaultChecked={editing?.active ?? true} />
          Activo
        </label>
        <label className="checkbox">
          <input name="featured" type="checkbox" defaultChecked={editing?.featured ?? false} />
          Destacado
        </label>
      </div>
      <p className="small muted">
        Carga y orden de fotografías reales, múltiples variantes y marcas: pendientes del adaptador
        de almacenamiento Supabase. V1 permite una variante por producto desde este editor.
      </p>
      <div className="button-row">
        <button className="button" disabled={busy}>
          {busy ? 'Guardando…' : 'Guardar producto'}
        </button>
        <button className="text-link" type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
