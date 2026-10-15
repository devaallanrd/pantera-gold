import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <Link href="/" className="footer-brand">
            PANTERA GOLD <span>CR</span>
          </Link>
          <p>Detalles que hablan de vos.</p>
          <p className="muted small">
            Joyería · Relojes · Colonias
            <br />
            Costa Rica
          </p>
        </div>
        <div>
          <h3>Explorá</h3>
          <Link href="/joyeria">Joyería</Link>
          <Link href="/relojes">Relojes</Link>
          <Link href="/colonias">Colonias</Link>
          <Link href="/nosotros">Nuestra esencia</Link>
        </div>
        <div>
          <h3>Te acompañamos</h3>
          <Link href="/contacto">
            Contacto <ArrowUpRight size={12} />
          </Link>
          <Link href="/seguimiento">Seguimiento de pedido</Link>
          <Link href="/preguntas-frecuentes">Preguntas frecuentes</Link>
          <Link href="/politica-de-envios">Envíos</Link>
          <Link href="/cambios-y-devoluciones">Cambios y devoluciones</Link>
        </div>
        <div>
          <h3>Información</h3>
          <Link href="/garantia">Garantía</Link>
          <Link href="/privacidad">Privacidad</Link>
          <Link href="/terminos">Términos y condiciones</Link>
          <Link href="/admin">Administración</Link>
          <p className="small muted">
            Contacto y redes oficiales
            <br />
            pendientes de confirmar.
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Pantera Gold CR</span>
        <span>Versión de demostración · Fotografías conceptuales</span>
        <span>CRC ₡ · Español</span>
      </div>
    </footer>
  );
}
