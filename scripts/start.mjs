// One robust dev command: free the ports (killing any stale server), then run
// the API + the Vite frontend together. Survives the "old node process is
// holding the port" problem that leaves you talking to out-of-date code.
import { spawn } from 'node:child_process';
import { freePort } from './freeport.mjs';

const API_PORT = Number(process.env.PORT) || 5050;
const WEB_PORT = Number(process.env.WEB_PORT) || 5173;

await freePort(API_PORT);
await freePort(WEB_PORT);

const children = [];
let shuttingDown = false;

function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const c of children) {
    try {
      c.kill();
    } catch {
      /* ignore */
    }
  }
  process.exit(0);
}

function run(label, command, args) {
  const child = spawn(command, args, { stdio: 'inherit', shell: true, env: process.env });
  children.push(child);
  child.on('exit', (code) => {
    if (!shuttingDown) {
      console.error(`\n[${label}] stopped (exit ${code}). Shutting down.`);
      shutdown();
    }
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log(`[start] launching API (:${API_PORT}) + frontend (:${WEB_PORT})…`);
run('api', 'node', ['server/index.js']);
run('web', 'npx', ['vite', '--port', String(WEB_PORT), '--strictPort']);
