# Supabase: diseño y conexión pendiente

El runtime actual utiliza SQLite local para permitir una V1 explorable sin cuentas externas. No se ha conectado Supabase ni se afirma haber validado RLS contra una instancia real. `001_initial.sql` es la primera migración para un proyecto Supabase vacío de staging; no ejecutar sobre una base existente sin revisar conflictos y respaldos.

## Puesta en marcha en staging

1. Crear proyecto, región y política de backups según necesidades del negocio. Registrar URL y claves en el gestor seguro del servidor.
2. Con Supabase CLI, vincular el proyecto de staging y ejecutar `supabase db push` tras revisar la migración. También puede aplicarse desde SQL Editor con rol autorizado en un proyecto vacío. La migración crea tablas en `public`, usa `auth.users` y configura `storage`.
3. Crear usuarios del equipo mediante Supabase Auth. Asignar `admin_roles` desde un proceso privilegiado, nunca desde metadatos editables por clientes. No hay rol administrativo por defecto. Activar MFA y recuperación.
4. Sustituir `src/lib/auth.ts` por sesiones Supabase SSR verificadas en servidor y `src/lib/store.ts` por un repositorio de datos Supabase con DTOs explícitos. Esto **requiere implementación**, no basta con añadir claves. Validar al usuario y su rol en cada mutación; usar cliente de usuario/RLS donde corresponda.
5. Usar `reserve_order` únicamente desde servidor de confianza tras validar datos, límites, políticas, moneda y tarifas reales. La función no acepta precios del navegador: bloquea variantes y productos, calcula snapshots, descuenta stock y escribe outbox en la misma transacción. Toma UUID de idempotencia y un hash SHA-256 de una clave de seguimiento aleatoria, no una contraseña del cliente.
6. Implementar estados/cancelaciones/expiración de reservas mediante funciones transaccionales, auditadas y con reposición exactamente una vez. Crear cancelaciones y liberación de reservas antes de habilitar pedidos reales. La demo sí implementa cancelación; SQL aún no incluye esa operación.
7. Conectar imágenes con validación MIME/tamaño, nombres de objeto aleatorios y eliminación segura de archivos huérfanos. El bucket `product-images` es público solo para fotografías aprobadas; no subir documentos de clientes. Crear editor de múltiples variantes, imágenes ordenadas, marcas y categorías; el editor demo actual es limitado.
8. Sustituir el catálogo conceptual. No publicar marcas, materiales ni autenticidad sin documentación. Mantener `active=false` hasta aprobación.

## Separación de datos

- Productos públicos no incluyen costo. Los costos están en `product_costs` y `order_costs`; snapshots internos de costo en `order_items` se restringen a administración.
- `orders` y sus contactos solo son consultables por personal autenticado. La consulta pública futura debe retornar un DTO limitado tras verificar número y hash de clave; nunca exponer tablas enteras ni buscar solo por correo.
- RLS se habilita en todas las tablas de `public` con denegación predeterminada. Clientes solo administran sus propias direcciones y carritos autenticados. El carrito invitado permanece local.
- `admin_roles` no tiene políticas de escritura de usuario. `is_staff` tiene search_path explícito y consulta solo el usuario actual.
- Variantes/inventario, pagos, eventos, newsletter y outbox no aceptan mutaciones directas desde navegador. El backend debe tener autorización y validación específica antes de usar service role, que omite RLS.
- La función de checkout no se otorga a anon/authenticated. Las líneas históricas rechazan update/delete mediante trigger.

## Pruebas obligatorias antes de conectar producción

Ejecutar con clientes anon, usuario A, usuario B, operador y admin: catálogo activo; rechazo de costos anónimos/operador; rechazo de pedidos ajenos; rechazo de autoasignación de rol; rechazo de escritura de stock; rechazo de RPC de checkout anónimo; upload no autorizado y MIME inválido; dos compras de última unidad; rollback de carrito mixto; reintento con mismo UUID; cancelación y pago simultáneos; importe y moneda de webhook; claves de seguimiento incorrectas; restauración de backups. Verificar grants además de políticas RLS. Estas pruebas de integración externa están pendientes.

La migración no debe considerarse una certificación de seguridad. Requiere revisión, ejecución y pruebas con el proyecto y adaptador definitivos.
