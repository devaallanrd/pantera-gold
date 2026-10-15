export const categories = [
  {
    slug: 'joyeria',
    name: 'Joyería',
    label: 'Pequeños grandes detalles',
    image: '/images/jewelry.jpg',
  },
  { slug: 'relojes', name: 'Relojes', label: 'El tiempo, a tu manera', image: '/images/watch.jpg' },
  {
    slug: 'colonias',
    name: 'Colonias',
    label: 'Una presencia inolvidable',
    image: '/images/fragrance.jpg',
  },
] as const;
export type Category = (typeof categories)[number]['slug'];
export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  type: string;
  description: string;
  price: number;
  image: string;
  featured: boolean;
  createdAt: string;
  active: boolean;
  specs: Record<string, string>;
  variants: { id: string; name: string; sku: string; stock: number }[];
};
export const seedProducts: Product[] = [
  {
    id: 'p1',
    slug: 'cadena-luz',
    name: 'Cadena Luz',
    category: 'joyeria',
    type: 'Cadenas',
    description:
      'Líneas delicadas y una silueta esencial para acompañar lo cotidiano. Pieza conceptual de demostración; composición y medidas pendientes de confirmar.',
    price: 28500,
    image: '/images/jewelry.jpg',
    featured: true,
    createdAt: '2026-10-01',
    active: true,
    specs: {
      Colección: 'Esenciales · demo',
      Acabado: 'Tono dorado ilustrativo',
      Material: 'Por confirmar',
    },
    variants: [{ id: 'v1', name: 'Modelo de muestra', sku: 'DEMO-JOY-001', stock: 8 }],
  },
  {
    id: 'p2',
    slug: 'reloj-meridiano',
    name: 'Reloj Meridiano',
    category: 'relojes',
    type: 'Clásicos',
    description:
      'Una propuesta de carácter sereno, con esfera limpia y proporciones equilibradas. Concepto de demostración, sin marca ni especificaciones comerciales verificadas.',
    price: 69000,
    image: '/images/watch.jpg',
    featured: true,
    createdAt: '2026-10-02',
    active: true,
    specs: {
      Estilo: 'Clásico',
      Marca: 'Sin marca comercial · demo',
      Mecanismo: 'Por confirmar',
      Material: 'Por confirmar',
    },
    variants: [{ id: 'v2', name: 'Modelo de muestra', sku: 'DEMO-REL-001', stock: 5 }],
  },
  {
    id: 'p3',
    slug: 'esencia-nocturna',
    name: 'Esencia Nocturna',
    category: 'colonias',
    type: 'Fragancias',
    description:
      'Una exploración visual del ritual de perfumarse. Artículo conceptual: familia olfativa, concentración, fabricante y origen pendientes de confirmar.',
    price: 42000,
    image: '/images/fragrance.jpg',
    featured: true,
    createdAt: '2026-10-03',
    active: true,
    specs: {
      Presentación: '100 ml · ejemplo',
      Tipo: 'Por confirmar',
      Familia: 'Por confirmar',
      Origen: 'Por confirmar',
    },
    variants: [{ id: 'v3', name: '100 ml · muestra', sku: 'DEMO-COL-001', stock: 6 }],
  },
  {
    id: 'p4',
    slug: 'collar-aura',
    name: 'Collar Aura',
    category: 'joyeria',
    type: 'Collares',
    description:
      'Un acento sutil para construir tu propia combinación. Artículo ilustrativo, no disponible para compra real.',
    price: 32500,
    image: '/images/jewelry.jpg',
    featured: true,
    createdAt: '2026-10-04',
    active: true,
    specs: { Colección: 'Esenciales · demo', Material: 'Por confirmar', Medidas: 'Por confirmar' },
    variants: [{ id: 'v4', name: 'Modelo de muestra', sku: 'DEMO-JOY-002', stock: 4 }],
  },
  {
    id: 'p5',
    slug: 'reloj-horizonte',
    name: 'Reloj Horizonte',
    category: 'relojes',
    type: 'Contemporáneos',
    description:
      'Diseño conceptual de reloj para explorar el catálogo. La fotografía es una referencia editorial y no representa un artículo comercial disponible.',
    price: 78500,
    image: '/images/watch.jpg',
    featured: false,
    createdAt: '2026-10-05',
    active: true,
    specs: {
      Estilo: 'Contemporáneo',
      Marca: 'Sin marca comercial · demo',
      Mecanismo: 'Por confirmar',
      Color: 'Por confirmar',
    },
    variants: [{ id: 'v5', name: 'Modelo de muestra', sku: 'DEMO-REL-002', stock: 3 }],
  },
  {
    id: 'p6',
    slug: 'esencia-alba',
    name: 'Esencia Alba',
    category: 'colonias',
    type: 'Fragancias',
    description:
      'Un concepto de fragancia para descubrir la experiencia de compra. Concentración y composición pendientes de verificar.',
    price: 38000,
    image: '/images/fragrance.jpg',
    featured: false,
    createdAt: '2026-10-06',
    active: true,
    specs: { Presentación: '50 ml · ejemplo', Tipo: 'Por confirmar', Familia: 'Por confirmar' },
    variants: [{ id: 'v6', name: '50 ml · muestra', sku: 'DEMO-COL-002', stock: 0 }],
  },
];
export const money = (n: number) =>
  new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    maximumFractionDigits: 0,
  }).format(n);
export const imageOptions = ['/images/jewelry.jpg', '/images/watch.jpg', '/images/fragrance.jpg'];
