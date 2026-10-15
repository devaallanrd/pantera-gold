// Isolated loopback-only integration-test instance. Credentials never apply to normal startup.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes, scryptSync } from 'node:crypto';
const directory = mkdtempSync(join(tmpdir(), 'pantera-e2e-'));
const salt = randomBytes(16).toString('hex');
const hash = (p) => salt + ':' + scryptSync(p, salt, 64).toString('hex');
const child = spawn(
  process.execPath,
  ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3100'],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      STORE_MODE: 'demo',
      DATA_DIR: directory,
      ADMIN_PASSWORD_HASH: hash('test-only-admin-password'),
      OPERATOR_PASSWORD_HASH: hash('test-only-operator-password'),
      SESSION_SECRET: randomBytes(32).toString('hex'),
    },
  },
);
function cleanup() {
  child.kill('SIGTERM');
}
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);
child.on('exit', (code) => {
  rmSync(directory, { recursive: true, force: true });
  process.exit(code ?? 0);
});
