import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { StoreProvider } from '@/components/store-provider';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Pantera Gold CR · Detalles que hablan de vos',
    template: '%s | Pantera Gold CR',
  },
  description:
    'Explorá la boutique digital de demostración de Pantera Gold CR: joyería, relojes y colonias. No se realizan ventas ni cobros reales.',
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CR">
      <body>
        <StoreProvider>
          <a className="skip-link" href="#contenido">
            Saltar al contenido
          </a>
          <Header />
          <main id="contenido">{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
