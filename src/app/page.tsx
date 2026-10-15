import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  PackageCheck,
  ShieldCheck,
  MessageCircle,
  MoveDown,
} from 'lucide-react';
import { categories } from '@/lib/catalog';
import { getProducts } from '@/lib/store';
import { ProductCard } from '@/components/product-card';
import { Newsletter } from '@/components/newsletter';
export const dynamic = 'force-dynamic';
export default function Home() {
  const products = getProducts();
  return (
    <>
      <section className="hero">
        <Image
          className="hero-image"
          src="/images/hero.jpg"
          alt="Composición editorial conceptual con joyería, reloj y fragancia"
          fill
          priority
          sizes="100vw"
        />
        <div className="hero-shade" />
        <div className="hero-content">
          <span className="eyebrow light">
            <span /> LA ESENCIA ESTÁ EN LOS DETALLES
          </span>
          <h1>
            No es solo
            <br />
            lo que llevás.
            <br />
            <em>Es lo que sos.</em>
          </h1>
          <p>
            Joyería, relojes y fragancias.
            <br />
            Descubrí un detalle que se sienta tuyo.
          </p>
          <Link className="button ivory" href="/catalogo">
            Explorar la colección <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="hero-bottom">
          <span>PANTERA GOLD CR — UNA NUEVA PERSPECTIVA</span>
          <span>
            EXPLORÁ <MoveDown size={13} />
          </span>
        </div>
        <span className="hero-caption">Imagen conceptual · Colección de demostración</span>
      </section>
      <div className="intro-strip">
        <span>Una expresión de tu estilo.</span>
        <p>Tres universos. Una forma de ser vos.</p>
        <span className="little-star">✧</span>
      </div>
      <section className="section categories-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ENCONTRÁ TU ESENCIA</span>
            <h2>El detalle hace la diferencia.</h2>
          </div>
          <Link className="text-link" href="/catalogo">
            Ver todo <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="category-grid">
          {categories.map((c, i) => (
            <Link href={'/' + c.slug} className="category-tile" key={c.slug}>
              <Image
                src={c.image}
                alt={`${c.name}, referencia visual conceptual`}
                fill
                sizes="(max-width: 700px) 100vw, 33vw"
              />
              <div className="category-overlay" />
              <span className="category-number">0{i + 1}</span>
              <div>
                <span>{c.label}</span>
                <h3>
                  {c.name}
                  <ArrowUpRight size={26} />
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="section featured">
        <div className="section-heading">
          <div>
            <span className="eyebrow">UNA SELECCIÓN PARA DESCUBRIR</span>
            <h2>Con carácter propio.</h2>
          </div>
          <Link className="text-link" href="/catalogo">
            Explorar productos <ArrowRight size={17} />
          </Link>
        </div>
        <p className="demo-note">
          Colección de demostración. Productos, precios, existencias e imágenes ilustrativos; no
          constituyen una oferta comercial.
        </p>
        <div className="product-grid">
          {products
            .filter((p) => p.featured)
            .slice(0, 4)
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
      </section>
      <section className="editorial">
        <div className="editorial-photo">
          <Image
            src="/images/jewelry.jpg"
            alt="Detalle editorial de una pieza conceptual"
            fill
            sizes="(max-width: 700px) 100vw, 50vw"
          />
          <span>EL ARTE DE ELEGIR UN DETALLE</span>
        </div>
        <div className="editorial-copy">
          <span className="eyebrow">NUESTRA ESENCIA</span>
          <h2>
            El lujo de
            <br />
            ser <em>vos mismo.</em>
          </h2>
          <p>
            Hay detalles que no necesitan decir mucho. Una pieza que acompaña, un reloj que se
            vuelve parte de tu día, una fragancia que deja su huella.
          </p>
          <p>
            Esta es la primera mirada a Pantera Gold CR: un espacio para descubrir joyería, relojes
            y colonias desde tu propio estilo.
          </p>
          <Link href="/nosotros" className="text-link">
            Conocé nuestra propuesta <ArrowUpRight size={17} />
          </Link>
          <span className="editorial-signature">Pantera Gold</span>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">SEGUÍ EXPLORANDO</span>
            <h2>Nuevas perspectivas.</h2>
          </div>
          <Link href="/catalogo?sort=new" className="text-link">
            Ver novedades <ArrowRight size={17} />
          </Link>
        </div>
        <div className="product-grid">
          {products
            .slice()
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .slice(0, 4)
            .map((p) => (
              <ProductCard product={p} key={p.id} />
            ))}
        </div>
      </section>
      <section className="trust-strip">
        <div>
          <ShieldCheck />
          <h3>Una compra transparente</h3>
          <p>Precios en colones. Sin cobros en esta demostración.</p>
        </div>
        <div>
          <PackageCheck />
          <h3>Cada detalle cuenta</h3>
          <p>Tarifas, cobertura y plazos de entrega por confirmar.</p>
        </div>
        <div>
          <MessageCircle />
          <h3>Estamos para ayudarte</h3>
          <p>Consultá tus dudas desde nuestro formulario de contacto.</p>
        </div>
      </section>
      <Newsletter />
    </>
  );
}
