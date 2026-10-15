# Operación y lanzamiento

## Desarrollo y despliegue de demostración

Node.js 24, `npm ci`, `npm run build`, `npm start`. Disco privado persistente para `DATA_DIR`; una instancia de servidor Node. No usar edge runtime ni serverless efímero con SQLite. El servidor local de Next recibe 3000 por defecto. TLS y un proxy inverso son necesarios en cualquier exposición fuera del desarrollo local.

Dependencias bloqueadas en package-lock. No instalar herramientas globales ni desactivar TLS. Las fotografías conceptuales generadas se almacenan localmente: no se necesitan dominios de CDN externos. Solo se requieren los dominios del registro npm durante instalación. Los destinos futuros de Supabase, pagos y correo dependerán de proveedores reales.

La demo tiene cuotas persistentes globales por endpoint, para una sola instancia. Esto limita abuso básico sin confiar en una IP de cabecera falsificable. Antes de producción, implementar límites por IP confiable detrás del proxy, cuenta y destino, protección distribuida, caducidad y mecanismos de desbloqueo. La defensa actual no pretende soportar tráfico comercial ni ataques de denegación.

## Copias de seguridad y recuperación local

Ejecutar `npm run backup -- /ruta/privada` para una copia consistente verificada. Para un reporte agregado manual, `npm run report:weekly`; no programa correos.

No copiar únicamente el archivo SQLite mientras se escribe: usa la API de backup de SQLite. Por ejemplo, con el servidor detenido, respaldar toda la carpeta DATA_DIR (base, WAL/SHM si existen y tracking.key) en almacenamiento privado cifrado. Alternativa consistente con servidor activo: usar la función `backup()` de `node:sqlite` y respaldar tracking.key, restringiendo acceso y verificando integridad. No subir copias a Git ni al bucket público de imágenes.

Para restaurar: detener el proceso, guardar una copia de seguridad del estado actual, restaurar base y clave desde la misma copia, ajustar permisos privados, iniciar y comprobar catálogo, login y seguimiento de un pedido de prueba conocido. Nunca probar restauración sobrescribiendo datos de producción. Definir objetivos RPO/RTO y ensayar restauración en staging. Para Supabase, habilitar backups/PITR según plan, respaldar además storage/configuración y probar el procedimiento oficial del proveedor.

## Revisión de producción pendiente

- Aprobar catálogo real, SKU, variantes, composición, marcas y fotos con derechos de uso. No usar fotografías conceptuales como evidencia de productos reales.
- Confirmar identidad legal, contactos, redes, política de privacidad y mecanismo de ejercicio de derechos, términos, garantía, cambios y envíos con asesoría local.
- Confirmar IVA, tratamiento de impuestos en precio y requisitos de facturación electrónica. La demo no emite factura fiscal ni calcula impuestos comerciales no aprobados.
- Conectar y validar Supabase Auth/DB/Storage, RLS, autorización por rol, MFA, recuperación y editor de múltiples variantes/archivos. Terminar controles de promociones y categorías.
- Implementar pagos reales, conciliación, webhooks verificados, cancelaciones, expiración de reservas, reembolsos e incidencias.
- Configurar envío: tarifas por zona, costo asumido, umbral gratuito solo tras validar margen, transportistas y tiempos reales.
- Implementar worker/cron/outbox con reintentos y deduplicación, proveedor de correo con dominio autenticado, WhatsApp oficial si aplica y gestión de consentimiento.
- Implementar analítica consentida, atribución UTM, reportes y costos completos por pedido. Ventas no equivalen a contribución ni a utilidad neta.
- Aplicar CSP con nonces/hashes de scripts según configuración de Next, límites distribuidos, tamaño de request en proxy, monitoreo, alertas y auditoría. La CSP actual permite inline para Next, bloquea frames, recursos externos y formularios ajenos; no es su forma más estricta.
- Ensayar backups, recuperación, accesibilidad con teclado y lector de pantalla, navegadores Safari/Firefox y rendimiento en dispositivos reales. Las pruebas actuales usan Chromium escritorio y ancho móvil.
- Validar carga y carreras bajo la arquitectura final distribuida. La prueba de última unidad actual valida SQLite multiproceso en una sola máquina, no PostgreSQL remoto.
- No activar indexación ni borrar mensajes demo hasta aprobar lo anterior. No desplegar pagos productivos por cambiar STORE_MODE: actualmente todo valor distinto de demo falla de forma cerrada.

## Límites de la V1

Gestión de una variante por producto en el editor; catálogo admite más variantes en el modelo. Imágenes de tres tipos seleccionables, sin upload/reordenamiento todavía. Marcas, categorías, promociones y costos variables por pedido no tienen editor completo. No hay usuarios clientes ni direcciones guardadas; compra como invitado. No hay proveedor externo activo, correos, cron, cobros, devoluciones monetarias ni facturación fiscal. Se registran notas de incidencias en pedidos, sin módulo de devoluciones. El dashboard no incluye datos de conversión, adquisición ni ganancias ficticias. El modelo Supabase está preparado, pero conectar y probar el adaptador es trabajo pendiente explícito.
