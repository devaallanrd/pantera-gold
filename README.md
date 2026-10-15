# Pantera Gold CR

Boutique digital en español de Costa Rica. **V1 funcional de demostración; no es un comercio listo para ventas reales.** Next.js App Router, React, TypeScript estricto, Tailwind CSS 4, Zod y Node.js 24. La persistencia actual es SQLite local con transacciones; Supabase tiene una migración de referencia, pero su adaptador de aplicación aún no está conectado.

## Ejecutar

```bash
cd /workspace/pantera-gold
npm ci
npm run dev
```

Abrir el puerto 3000 en un entorno que permita navegación. `npm run build` compila y `npm start` ejecuta el servidor compilado. Node 24 es necesario por `node:sqlite`. La base se crea en `.data/demo.sqlite`, está ignorada por Git y no se debe exponer mediante un servidor de archivos. No usar este adaptador en despliegues sin disco persistente ni en réplicas distribuidas. Para elegir otra carpeta, establecer `DATA_DIR` en el proceso.

El checkout, contacto y newsletter usan datos ficticios. Los correos **no se envían**. El stock de prueba se descuenta de forma transaccional, las cancelaciones lo restituyen una sola vez y las líneas de pedido conservan su precio y nombre históricos. Un reintento con la misma clave UUID no crea otro pedido. Las claves de seguimiento se almacenan como hash; guardar también `.data/tracking.key` en una copia de seguridad privada.

## Variables de entorno

Copiar `.env.example` a `.env.local` para desarrollo (archivo ignorado). No pegar secretos en el repositorio, el chat ni logs.

| Variable                                                         | Uso                                                                                                                    |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `STORE_MODE`                                                     | `demo`. Cualquier otro valor bloquea el acceso al almacén; no existe un modo de ventas real activable por variable.    |
| `DATA_DIR`                                                       | Carpeta privada con SQLite y clave de seguimiento; por defecto `.data`.                                                |
| `NEXT_PUBLIC_SITE_URL`                                           | Origen canónico. `http://localhost:3000` durante desarrollo.                                                           |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`                                    | Opcional: número oficial confirmado, solo dígitos e indicativo. Vacío muestra contacto en lugar de inventar un número. |
| `ADMIN_PASSWORD_HASH`                                            | Hash scrypt generado localmente. No hay clave predeterminada.                                                          |
| `OPERATOR_PASSWORD_HASH`                                         | Hash scrypt independiente y opcional para operaciones.                                                                 |
| `SESSION_SECRET`                                                 | Secreto aleatorio de al menos 32 caracteres; rotarlo invalida sesiones.                                                |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Reservadas para el adaptador futuro. No se utilizan en la demo. Service role solo en servidor.                         |

En una terminal interactiva, `npm run admin:password` pide una contraseña oculta de mínimo 16 caracteres y genera un hash y un secreto de sesión. Guardar su salida únicamente en `.env.local` o en la configuración segura del servidor; no publicarla. Repetir para un operador y usar su hash como `OPERATOR_PASSWORD_HASH`, conservando un único secreto de sesión. Reiniciar el proceso tras cambiar variables. `/admin` permanece cerrado si falta configuración. Usar HTTPS en despliegue: la cookie de producción es Secure, HttpOnly y SameSite=Strict. Es una autenticación local para demo, sin MFA ni recuperación: reemplazarla por Supabase Auth antes de producción.

## Qué funciona

- Inicio editorial, categorías, catálogo con búsqueda, filtros disponibles, ordenamiento y paginación; comparación de hasta tres productos.
- Ficha, variantes del modelo, cantidad, stock servidor, carrito persistente en navegador, eliminación y códigos promocionales validados en servidor.
- Checkout de invitado sin cobros; pedidos locales, snapshots, idempotencia, movimientos de stock y seguimiento mediante número y clave privada de alta entropía.
- Panel con login y roles; catálogo con una variante editable por producto, precio y costo privado, creación y archivo, destacados; estados de pedidos, guía, notas, inventario y auditoría.
- Registro local de consultas y consentimiento. Cola transaccional de eventos para futuras notificaciones, sin envíos simulados.
- Rutas institucionales provisionales, 404, metadatos, sitemap y robots que bloquean indexación de la demo. Sin reseñas ni Product JSON-LD para mercancía ficticia.

Los descuentos no están precargados ni anunciados. La tabla local `promotions` permite a un desarrollador configurar un código de prueba; el panel de promociones aún no está implementado. No se presentan ingresos ficticios como ventas ni utilidad. El dashboard diferencia pedidos de prueba, pagos inexistentes y métricas no disponibles.

## Archivos relevantes

```text
src/app/                 Rutas, metadatos y endpoints de servidor
  api/                   Checkout, cotización, seguimiento, formularios y admin
  admin/                 Panel protegido por sesión de servidor
  producto/[slug]/       Ficha de producto
  [page]/                Información institucional y políticas provisionales
src/components/          Componentes de tienda, formularios y administración
src/lib/
  catalog.ts             Tipos, seis ejemplos conceptuales y formato CRC
  store.ts               Persistencia demo, transacciones, inventario y auditoría
  auth.ts                Contraseñas scrypt, sesiones firmadas y roles
  schemas.ts             Validaciones compartidas Zod
  integrations.ts        Contratos de pagos, notificaciones y analítica pendientes
public/images/           Cuatro imágenes conceptuales generadas, servidas localmente
supabase/migrations/     Modelo PostgreSQL, RLS, storage y primitiva transaccional
scripts/                 Generación de credenciales y servidor aislado de pruebas
tests/                  Pruebas de lógica, concurrencia y navegador
 docs/                   Supabase, integraciones y operación/producción
```

## Validación

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Las pruebas de navegador requieren Chromium. Por defecto buscan `/usr/bin/chromium`; establecer `CHROMIUM_PATH` para otra instalación, o instalar Chromium de Playwright y apuntar a su ejecutable. `test:e2e` usa un servidor aislado en loopback:3100, una base temporal y contraseñas exclusivas de pruebas. No configura credenciales de la tienda normal. No ejecutar otro servidor en ese puerto. El servidor temporal se limpia al finalizar; capturas y trazas quedan en `test-results/` (ignorado).

## Operación local

`npm run backup -- /ruta/privada` crea una copia consistente de SQLite y la clave de seguimiento en una carpeta nueva con permisos privados, y verifica integridad. `npm run report:weekly` calcula un resumen agregado de los últimos siete días sin datos de clientes; no envía correos ni confunde montos demo con ingresos. La programación periódica aún no está conectada.

## Próximo paso a producción

Leer [Supabase](docs/SUPABASE.md), [pagos y automatizaciones](docs/INTEGRATIONS.md) y [operación](docs/OPERATIONS.md). Se necesitan catálogo y fotografías reales, precios/costos aprobados, datos legales, condiciones, tarifas, un proyecto Supabase, una pasarela elegida y proveedores de notificación. El esquema SQL requiere validación en staging: no se aplicó a un proyecto externo en esta sesión. **No cambiar etiquetas demo ni habilitar cobros solo modificando variables.**
