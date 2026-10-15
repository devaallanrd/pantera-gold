import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedOrigin } from '../src/lib/origin';
test('acepta origen público con Host preservado aunque Next escuche en 0.0.0.0', () => {
  assert.equal(isAllowedOrigin('http://localhost:3000', 'localhost:3000'), true);
  assert.equal(isAllowedOrigin('https://tienda.example', 'tienda.example'), true);
});
test('rechaza orígenes externos, malformados y puertos diferentes', () => {
  assert.equal(isAllowedOrigin('https://evil.example', 'tienda.example'), false);
  assert.equal(isAllowedOrigin('null', 'tienda.example'), false);
  assert.equal(isAllowedOrigin('https://tienda.example/extra', 'tienda.example'), false);
  assert.equal(isAllowedOrigin('http://localhost:3001', 'localhost:3000'), false);
});
test('no usa cabeceras reenviadas para ampliar orígenes y admite clientes sin Origin', () => {
  assert.equal(isAllowedOrigin('https://evil.example', null), false);
  assert.equal(isAllowedOrigin(null, 'localhost:3000'), true);
});
