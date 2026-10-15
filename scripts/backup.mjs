import { DatabaseSync, backup } from 'node:sqlite';
import { mkdirSync, existsSync, copyFileSync, chmodSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { randomUUID } from 'node:crypto';
const source = resolve(process.env.DATA_DIR ?? '.data');
const destination = process.argv[2];
if (!destination || !existsSync(join(source, 'demo.sqlite'))) {
  console.error('Uso: npm run backup -- /ruta/privada. Primero inicia la demo para crear la base.');
  process.exit(1);
}
const folder = join(
  resolve(destination),
  'pantera-' + new Date().toISOString().replaceAll(':', '-') + '-' + randomUUID().slice(0, 8),
);
mkdirSync(folder, { recursive: true, mode: 0o700 });
const db = new DatabaseSync(join(source, 'demo.sqlite'), { readOnly: true });
try {
  await backup(db, join(folder, 'demo.sqlite'));
  chmodSync(join(folder, 'demo.sqlite'), 0o600);
  if (existsSync(join(source, 'tracking.key'))) {
    copyFileSync(join(source, 'tracking.key'), join(folder, 'tracking.key'));
    chmodSync(join(folder, 'tracking.key'), 0o600);
  }
  const check = new DatabaseSync(join(folder, 'demo.sqlite'), { readOnly: true });
  const result = check.prepare('PRAGMA quick_check').get();
  check.close();
  if (result.quick_check !== 'ok') throw new Error('Falló la integridad del backup');
  writeFileSync(
    join(folder, 'manifest.json'),
    JSON.stringify({ createdAt: new Date().toISOString(), store: 'demo', integrity: 'ok' }),
    { mode: 0o600 },
  );
  console.log('Backup consistente creado en: ' + folder);
} finally {
  db.close();
}
