import { randomBytes, scryptSync } from 'node:crypto';
import { createInterface } from 'node:readline';
if (!process.stdin.isTTY) {
  console.error('Ejecuta en una terminal interactiva.');
  process.exit(1);
}
const rl = createInterface({ input: process.stdin, output: process.stdout });
process.stdout.write('Contraseña administrativa (mínimo 16 caracteres, entrada oculta): ');
const original = rl._writeToOutput;
rl._writeToOutput = () => {};
rl.question('', (password) => {
  rl._writeToOutput = original;
  rl.close();
  if (password.length < 16) {
    console.error('\nUsa al menos 16 caracteres.');
    process.exit(1);
  }
  const salt = randomBytes(16).toString('hex');
  console.log(
    '\nADMIN_PASSWORD_HASH=' + salt + ':' + scryptSync(password, salt, 64).toString('hex'),
  );
  console.log('SESSION_SECRET=' + randomBytes(32).toString('hex'));
});
