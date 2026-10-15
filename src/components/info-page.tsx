import Link from 'next/link';
export const infoPages: Record<
  string,
  { title: string; eyebrow: string; intro: string; sections: { title: string; text: string }[] }
> = {
  nosotros: {
    title: 'Los detalles cuentan tu historia.',
    eyebrow: 'NUESTRA ESENCIA',
    intro:
      'Pantera Gold CR es un proyecto costarricense de joyería, relojes y colonias. Esta tienda presenta una dirección visual y una experiencia de compra en desarrollo.',
    sections: [
      {
        title: 'Una mirada propia',
        text: 'La propuesta reúne tres universos bajo una idea: elegir detalles que expresen tu estilo. El catálogo actual es conceptual y no representa mercancía disponible para venta.',
      },
      {
        title: 'Una marca por conocer',
        text: 'La historia del negocio, su equipo, dirección comercial y fotografías reales están pendientes de proporcionar por el propietario. No se afirman certificaciones, materiales, representaciones oficiales ni garantías sin verificar.',
      },
    ],
  },
  'preguntas-frecuentes': {
    title: 'Hablemos de los detalles.',
    eyebrow: 'PREGUNTAS FRECUENTES',
    intro: 'Respuestas sobre esta primera versión de la tienda.',
    sections: [
      {
        title: '¿Se puede comprar de verdad?',
        text: 'No. Esta versión permite explorar el catálogo y crear pedidos de demostración. No se procesa dinero ni se despachan productos.',
      },
      {
        title: '¿Los productos, imágenes y precios son reales?',
        text: 'Son ejemplos identificados como demo. Las fotografías fueron generadas como referencias conceptuales; materiales, fabricantes, precios y disponibilidad comerciales deben ser confirmados.',
      },
      {
        title: '¿Cómo sigo un pedido de prueba?',
        text: 'Al crearlo recibís un número de pedido y una clave privada de seguimiento. Guardá ambos y utilizalos en Seguimiento. La consulta no revela datos de contacto.',
      },
      {
        title: '¿Qué pagos y entregas habrá?',
        text: 'La pasarela, los métodos de pago, la cobertura y las tarifas se definirán con el propietario. SINPE, tarjetas o envíos no están activos en esta versión.',
      },
      {
        title: '¿Cómo contacto al negocio?',
        text: 'Podés probar el formulario de contacto. Guarda consultas en el panel local, pero no envía correos. Los canales oficiales están pendientes de confirmar.',
      },
    ],
  },
  'politica-de-envios': {
    title: 'Cada entrega, con claridad.',
    eyebrow: 'ENVÍOS · BORRADOR',
    intro:
      'Texto provisional para revisión del propietario. No constituye una política comercial aprobada.',
    sections: [
      {
        title: 'Cobertura y tarifas pendientes',
        text: 'El comercio debe confirmar provincias, cantones, transportistas, costos, tiempos estimados y condiciones de entrega antes de activar ventas.',
      },
      {
        title: 'En esta demostración',
        text: 'No se generan envíos reales. El checkout muestra el total de artículos de prueba sin atribuir costos o promesas de entrega no confirmados.',
      },
      {
        title: 'Seguimiento y atención',
        text: 'La plataforma contempla transportista y número de guía. El procedimiento por retrasos, dirección incorrecta o paquetes dañados debe ser definido y revisado legalmente.',
      },
    ],
  },
  'cambios-y-devoluciones': {
    title: 'Una experiencia bien acompañada.',
    eyebrow: 'CAMBIOS Y DEVOLUCIONES · BORRADOR',
    intro:
      'Contenido provisional, pendiente de revisión comercial y jurídica conforme a la legislación aplicable en Costa Rica.',
    sections: [
      {
        title: 'Condiciones por definir',
        text: 'El propietario debe confirmar el procedimiento, los plazos, requisitos de comprobante, condición del artículo y medios de atención. No se establecen restricciones ni renuncias a derechos legales en este borrador.',
      },
      {
        title: 'Reembolsos',
        text: 'La integración deberá registrar solicitudes y resolverlas mediante el proveedor de pagos cuando corresponda. En demostración no hay cobros ni reembolsos reales.',
      },
    ],
  },
  garantia: {
    title: 'Información que inspira confianza.',
    eyebrow: 'GARANTÍA · BORRADOR',
    intro:
      'No se ofrecen garantías comerciales específicas hasta verificar cada producto y aprobar sus condiciones.',
    sections: [
      {
        title: 'Información por producto',
        text: 'Composición, procedencia, mecanismo, resistencia al agua y respaldo del fabricante deberán documentarse antes de publicar el catálogo real.',
      },
      {
        title: 'Atención y derechos',
        text: 'Se debe definir el canal y procedimiento de reclamo, sin perjuicio de los derechos legales del consumidor. Este contenido requiere revisión del propietario y asesoría jurídica.',
      },
    ],
  },
  privacidad: {
    title: 'Tus datos merecen cuidado.',
    eyebrow: 'PRIVACIDAD · BORRADOR',
    intro:
      'Aviso provisional para la demostración. Usá únicamente datos ficticios. El responsable legal, domicilio y canal para ejercer derechos están pendientes de identificar.',
    sections: [
      {
        title: 'Datos y finalidad en la demo',
        text: 'Los pedidos de prueba guardan nombre, correo, teléfono y dirección ficticios en una base local. El formulario de contacto guarda tu consulta; la suscripción registra correo, fecha y versión de consentimiento. No se envían campañas ni se comparten datos con pasarelas.',
      },
      {
        title: 'Acceso y conservación',
        text: 'El panel requiere autenticación de servidor. La consulta de pedidos usa una clave privada. Antes de producción deben aprobarse plazos de conservación, procedimientos de eliminación y acceso, respaldos, proveedores y transferencias internacionales.',
      },
      {
        title: 'Cookies y analítica',
        text: 'El carrito usa almacenamiento local del navegador. La administración utiliza una cookie de sesión HttpOnly. No hay rastreadores publicitarios ni analítica de terceros activa. La medición futura deberá respetar el consentimiento aplicable.',
      },
      {
        title: 'Retiro del consentimiento',
        text: 'El comercio deberá publicar un canal verificable para retirar consentimiento y ejercer derechos antes de recibir datos reales. En desarrollo, el responsable del entorno puede eliminar los registros locales desde un proceso administrativo controlado.',
      },
    ],
  },
  terminos: {
    title: 'Las cosas claras, desde el inicio.',
    eyebrow: 'TÉRMINOS · BORRADOR',
    intro:
      'Esta es una demostración técnica de Pantera Gold CR. No existe una oferta comercial activa ni se celebran compras reales.',
    sections: [
      {
        title: 'Uso de la demostración',
        text: 'Los productos, imágenes, precios y existencias son ilustrativos. Los pedidos de prueba no son comprobantes de pago, reservas de mercancía real ni contratos de compraventa.',
      },
      {
        title: 'Antes de activar el comercio',
        text: 'El propietario debe aprobar razón social, cédula jurídica o física comercial, domicilio, canales de contacto, impuestos, facturación, condiciones de pago, entregas, garantías, privacidad y atención al consumidor.',
      },
      {
        title: 'Revisión jurídica',
        text: 'El texto no sustituye asesoría jurídica. Se debe verificar su conformidad con la normativa costarricense y los derechos del consumidor antes de publicar una versión comercial.',
      },
    ],
  },
};
export function InfoPage({ page }: { page: (typeof infoPages)[string] }) {
  return (
    <article className="info-page">
      <nav className="breadcrumbs">
        <Link href="/">Inicio</Link>
        <span>/</span>
        <span>Pantera Gold CR</span>
      </nav>
      <span className="eyebrow">{page.eyebrow}</span>
      <h1>{page.title}</h1>
      <p className="info-intro">{page.intro}</p>
      {page.sections.map((s) => (
        <section key={s.title}>
          <h2>{s.title}</h2>
          <p>{s.text}</p>
        </section>
      ))}
      <Link href="/contacto" className="text-link">
        ¿Necesitás ayuda? Contactanos →
      </Link>
    </article>
  );
}
