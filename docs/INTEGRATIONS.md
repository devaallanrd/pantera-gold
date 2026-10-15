# Pagos, automatizaciones y medición

## Estado real

No hay proveedor de pagos, correo, WhatsApp Business ni analítica conectado. `/api/webhooks/payment` rechaza todos los eventos con 503 y no modifica pedidos. No existe forma de marcar un pedido demo como pagado desde el panel. Los contratos en `src/lib/integrations.ts` son puntos de extensión, no servicios operativos.

## Elección de pasarela en Costa Rica

No se ha seleccionado ni afirmado disponibilidad de un proveedor. Antes de contratar, obtener documentación oficial vigente y una propuesta comercial para **este comercio y estos productos**. Registrar:

| Criterio    | Evidencia necesaria                                                             |
| ----------- | ------------------------------------------------------------------------------- |
| Admisión    | Entidad legal, país de liquidación y aprobación de categoría comercial          |
| Costos      | Comisión, costo fijo, impuestos, mensualidad y cargos por reembolso/contracargo |
| Métodos     | Tarjetas/redes admitidas, moneda CRC y métodos locales verificados              |
| Liquidación | Plazos, reservas, banco receptor y conciliación                                 |
| Operación   | Sandbox, checkout alojado, firma webhook, idempotencia y soporte                |
| Riesgo      | Contracargos, devoluciones y reglas antifraude                                  |

Después, implementar `PaymentGateway` con el SDK oficial y credenciales de sandbox en el servidor. El navegador solo recibe la URL de un checkout alojado. Nunca recolectar PAN/CVV ni guardar credenciales financieras.

### Procesamiento verificado

1. Crear intento de pago para un pedido reservado, con moneda/importe calculados en servidor y clave de idempotencia.
2. Recibir cuerpo crudo del webhook; verificar firma, timestamp y ventana antirreplay según especificación oficial. No inventar un algoritmo genérico.
3. Guardar `payment_events` con unicidad proveedor/evento. Bloquear el pago/pedido y validar referencia, moneda, importe y transición antes de confirmar en una sola transacción.
4. Generar evento de confirmación en outbox dentro de esa transacción; responder duplicados de forma idempotente. Una redirección o captura del usuario no prueba pago.
5. Conciliar con API autenticada del proveedor y revisar eventos no resueltos. Implementar reembolsos/cancelaciones con estados explícitos antes de producción.

SINPE Móvil no está activo. Si el propietario lo aprueba, guardar el pedido pendiente y confirmar solo mediante conciliación bancaria fiable con evidencia y auditoría. No confiar en una imagen de comprobante ni habilitar un botón «pagado» sin verificación.

## Outbox y mensajería

La demo escribe `order.received`, `inventory.low`, `order.preparing`, `order.shipped`, `order.delivered` o cancelación en la misma transacción que la operación. Estado: `pending_integration`. No hay worker, cron, envío, reintento automático ni destinatario externo activo.

Implementar un worker servidor para Supabase: reclamar lotes con `FOR UPDATE SKIP LOCKED`, marcar processing y locked_at, invocar proveedor con deduplication_key, guardar providerId y sent, y liberar fallos con backoff exponencial y jitter. Limitar intentos, registrar solo códigos de error y recuperar locks caducados. Los proveedores deben admitir idempotencia o un mecanismo equivalente: una caída después de enviar puede duplicar sin él. No registrar direcciones, tokens, cuerpos de webhooks ni datos financieros en logs.

- Confirmación: correo transaccional tras pedido persistido; mensaje distinto tras pago realmente confirmado.
- Stock bajo: alertas internas deduplicadas por cruce de umbral, no por cada visita.
- Envío: guía y transportista aprobados, enlaces de transportista permitidos; no convertir URLs arbitrarias en enlaces de seguimiento.
- Carrito abandonado: la demo no guarda correo en el carrito ni envía recordatorios. Añadir captura legítima, consentimiento aplicable, exclusión de pedidos completados, máximo de recordatorios, baja y deduplicación.
- Postventa: solo tras entrega y permiso correspondiente, sin recompensas condicionadas a opiniones positivas.
- Reporte semanal: cron autenticado, zona `America/Costa_Rica`, ventas confirmadas netas, costos completos y contribución. No confundir facturación con utilidad. Deduplicar por semana/destinatario.
- WhatsApp: el enlace manual solo aparece con un número oficial configurado. Automatización requiere WhatsApp Business Platform o proveedor oficial, plantillas aprobadas, opt-in, bajas y límites. No usar automatizaciones de WhatsApp Web.

## Analítica y SEO

No hay trackers instalados ni datos inventados. El contrato `recordAnalytics` es inactivo. Integrar proveedor tras acordar política de cookies/consentimiento y retención. Medir view_item, add_to_cart y begin_checkout respetando consentimiento; purchase solo desde pago confirmado con transaction_id deduplicado. Conservar UTM de forma limitada y con política definida, sin datos personales. Esa captura y atribución aún están pendientes.

Robots y metadatos bloquean indexación de la demo. Activar indexación, canonical de dominio real, Open Graph y Product JSON-LD únicamente para productos reales con precio, stock, material y marca verificados. Nunca agregar reseñas agregadas o datos estructurados de ofertas ficticias.
