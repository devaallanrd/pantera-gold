import { test, expect } from '@playwright/test';
test('inicio editorial, categorías y fotografías locales', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Es lo que sos.');
  await expect(page.locator('.category-tile')).toHaveCount(3);
  for (const image of await page.locator('.hero-image,.category-tile img').all()) {
    await expect(image).toBeVisible();
    expect(await image.evaluate((n: HTMLImageElement) => n.complete && n.naturalWidth > 0)).toBe(
      true,
    );
  }
  await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true });
});
test('catálogo busca, vacía, filtra y compara', async ({ page }) => {
  await page.goto('/catalogo');
  await page.getByRole('textbox', { name: 'Buscar productos' }).fill('Meridiano');
  await expect(page.locator('.product-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Agregar Reloj Meridiano a comparación' }).click();
  await expect(page.getByRole('heading', { name: 'Compará tus favoritos' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Buscar productos' }).fill('inexistente');
  await expect(page.getByText('No encontramos productos con estos filtros.')).toBeVisible();
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  await expect(page.locator('.product-card')).toHaveCount(6);
});
test('producto, carrito persistente, checkout y seguimiento privado', async ({ page }) => {
  await page.goto('/producto/cadena-luz');
  await page.getByRole('button', { name: 'Agregar al carrito' }).click();
  await page.getByRole('link', { name: 'Ver mi carrito' }).click();
  await expect(page.getByRole('heading', { name: 'Cadena Luz' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Cadena Luz' })).toBeVisible();
  await page.getByRole('link', { name: 'Continuar al checkout' }).click();
  await page.getByLabel('Nombre completo').fill('Persona de prueba');
  await page.getByLabel('Correo electrónico').fill('persona@example.test');
  await page.getByLabel('Teléfono').fill('88888888');
  await page
    .getByLabel('Cantón, distrito y dirección')
    .fill('Dirección ficticia de prueba, sin entrega');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Crear pedido de demostración' }).click();
  await expect(page.getByRole('heading', { name: /Tu pedido de prueba/ })).toBeVisible();
  const id = await page.locator('.confirmation-card h2').innerText();
  const token = await page.getByLabel('Clave privada de seguimiento').inputValue();
  await page.getByRole('link', { name: 'Consultar mi pedido' }).click();
  await page.getByLabel('Número de pedido').fill(id);
  await page.getByLabel('Clave privada de seguimiento').fill(token);
  await page.getByRole('button', { name: 'Consultar pedido' }).click();
  await expect(page.locator('.tracking-result')).toContainText('Sin cobro');
  await expect(page.locator('.tracking-result')).not.toContainText('persona@example.test');
});
test('endpoints rechazan acceso anónimo, origen ajeno y eventos de pago', async ({ request }) => {
  expect((await request.post('/api/admin/products', { data: {} })).status()).toBe(403);
  expect((await request.post('/api/admin/orders', { data: {} })).status()).toBe(403);
  expect(
    (
      await request.post('/api/newsletter', {
        headers: { Origin: 'https://evil.example' },
        data: {},
      })
    ).status(),
  ).toBe(403);
  expect((await request.post('/api/webhooks/payment', { data: { state: 'paid' } })).status()).toBe(
    503,
  );
  expect(
    (
      await request.post('/api/checkout', { data: { items: [{ variantId: 'v1', quantity: 99 }] } })
    ).status(),
  ).toBe(400);
});
test('admin requiere autenticación y permite editar con auditoría', async ({ page }) => {
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Administración.', exact: true })).toBeVisible();
  await page.getByLabel('Contraseña').fill('test-only-admin-password');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Una mirada a tu negocio.' })).toBeVisible();
  await page.getByRole('button', { name: 'Productos', exact: true }).click();
  await page.getByRole('button', { name: 'Editar', exact: true }).first().click();
  await page.getByLabel('Costo interno CRC (opcional)').fill('12500');
  await page.getByRole('button', { name: 'Guardar producto', exact: true }).click();
  await expect(page.locator('.admin-content .form-status')).toContainText('Producto guardado');
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page.getByRole('heading', { name: 'Administración.', exact: true })).toBeVisible();
  const response = await page.request.get('/catalogo');
  expect(await response.text()).not.toContain('12500');
});
test('operaciones no recibe costos ni puede modificar catálogo', async ({ page }) => {
  await page.goto('/admin');
  await page.getByLabel('Perfil').selectOption('operator');
  await page.getByLabel('Contraseña').fill('test-only-operator-password');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Una mirada a tu negocio.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Productos', exact: true })).toHaveCount(0);
  expect((await page.request.post('/api/admin/products', { data: {} })).status()).toBe(403);
});
test('formularios guardan consultas y consentimiento', async ({ page }) => {
  await page.goto('/contacto');
  await page.getByLabel('Tu nombre').fill('Contacto de prueba');
  await page.getByLabel('Correo electrónico').fill('contacto@example.test');
  await page
    .getByLabel('¿En qué te ayudamos?')
    .fill('Consulta ficticia para validar el formulario.');
  await page.getByRole('checkbox', { name: /Acepto guardar mi consulta/ }).check();
  await page.getByRole('button', { name: 'Guardar consulta de prueba' }).click();
  await expect(page.locator('.contact-layout [role=status]')).toContainText('Consulta guardada');
  await page.goto('/');
  await page.getByLabel('Tu correo electrónico').fill('news@example.test');
  await page.getByRole('checkbox', { name: /Acepto guardar mi correo/ }).check();
  await page.getByRole('button', { name: 'Suscribirme a novedades' }).click();
  await expect(page.locator('.newsletter [role=status]')).toContainText('Consentimiento guardado');
});
test('móvil: menú, compra y ausencia de desbordamiento horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await page
    .getByRole('navigation', { name: 'Navegación móvil' })
    .getByRole('link', { name: 'Joyería' })
    .click();
  await expect(page.getByRole('heading', { name: 'Joyería', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.goto('/producto/reloj-meridiano');
  await expect(page.getByRole('button', { name: 'Agregar al carrito' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: 'test-results/product-mobile.png', fullPage: true });
});
test('rutas institucionales, SEO y 404', async ({ page, request }) => {
  for (const route of [
    '/nosotros',
    '/preguntas-frecuentes',
    '/politica-de-envios',
    '/cambios-y-devoluciones',
    '/garantia',
    '/privacidad',
    '/terminos',
  ]) {
    const r = await request.get(route);
    expect(r.status()).toBe(200);
  }
  expect((await request.get('/sitemap.xml')).status()).toBe(200);
  expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /');
  await page.goto('/pagina-inexistente');
  await expect(page.getByRole('heading', { name: 'Este detalle no está aquí.' })).toBeVisible();
});
